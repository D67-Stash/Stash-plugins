console.log("[Performer Header] Plugin Loaded");

(function () {
    "use strict";

    const BANNER_ID = "performer-random-scenes-banner";

    const performerCache = new Map();
    const bannerCache = new Map();

    let currentPerformerId = null;
    let buildInProgress = false;

    async function gql(query, variables = {}) {
        const response = await fetch("/graphql", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query,
                variables,
            }),
        });

        return await response.json();
    }

    function getPerformerId() {
        const match = location.pathname.match(/^\/performers\/(\d+)/);
        return match ? match[1] : null;
    }

    function shuffle(array) {
        const copy = [...array];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    async function getPerformerSceneImages(performerId) {

        if (performerCache.has(performerId)) {
            return performerCache.get(performerId);
        }

        try {

            const result = await gql(
                `
                query FindPerformer($id: ID!) {
                    findPerformer(id: $id) {
                        scenes {
                            id
                            title
                            paths {
                                screenshot
                            }
                        }
                    }
                }
                `,
                { id: performerId }
            );

            const performer = result?.data?.findPerformer;

            if (!performer) {
                return [];
            }

            const scenes =
                performer.scenes
                    ?.filter(
                        scene =>
                            scene?.paths?.screenshot &&
                            scene.paths.screenshot.length > 0
                    )
                    .map(scene => ({
                        id: scene.id,
                        title: scene.title,
                        image: scene.paths.screenshot,
                    })) || [];

            performerCache.set(performerId, scenes);

            return scenes;

        } catch (err) {
            console.error("[Performer Header] GraphQL Error", err);
            return [];
        }
    }

    function removeBanner() {
        document.getElementById(BANNER_ID)?.remove();
    }

    function createBanner(scenes) {

        removeBanner();

        if (!scenes.length) {
            return;
        }

        const banner = document.createElement("div");
        banner.id = BANNER_ID;

        banner.style.cssText = `
            width:100%;
            margin-bottom:20px;
            border-radius:10px;
            overflow:hidden;
            background:#111;
            border:1px solid rgba(255,255,255,.08);
        `;

        banner.innerHTML = `
            <div id="performer-image-grid"
                 style="
                    display:grid;
                    grid-template-columns:repeat(6,1fr);
                    gap:4px;
                    padding:4px;
                 ">
            </div>
        `;

        const grid = banner.querySelector("#performer-image-grid");

        scenes.forEach(scene => {

            const cell = document.createElement("a");

            cell.href = `/scenes/${scene.id}`;
            cell.title = scene.title;

            cell.style.cssText = `
                display:block;
                overflow:hidden;
                aspect-ratio:3/2;
                border-radius:6px;
                background:#000;
                position:relative;
                text-decoration:none;
                z-index:1;
            `;

            cell.innerHTML = `
                <img
                    src="${scene.image}"
                    loading="lazy"
                    style="
                        width:100%;
                        height:100%;
                        object-fit:cover;
                        transition:transform .25s ease;
                    "
                />

                <div class="scene-title-overlay"
                     style="
                        position:absolute;
                        left:0;
                        right:0;
                        bottom:0;
                        padding:6px 8px;
                        background:linear-gradient(
                            transparent,
                            rgba(0,0,0,.85)
                        );
                        color:white;
                        font-size:11px;
                        line-height:1.3;
                        opacity:0;
                        transition:opacity .2s ease;
                        pointer-events:none;
                        white-space:nowrap;
                        overflow:hidden;
                        text-overflow:ellipsis;
                    ">
                    ${scene.title}
                </div>
            `;

            const img = cell.querySelector("img");
            const overlay = cell.querySelector(".scene-title-overlay");

            cell.addEventListener("mouseenter", () => {
                img.style.transform = "scale(1.08)";
                overlay.style.opacity = "1";
            });

            cell.addEventListener("mouseleave", () => {
                img.style.transform = "scale(1)";
                overlay.style.opacity = "0";
            });

            cell.addEventListener("click", (e) => {
                console.log(
                    "[Performer Header] Opening scene:",
                    scene.id,
                    scene.title
                );
            });

            grid.appendChild(cell);
        });

        const target =
            document.querySelector(".detail-header") ||
            document.querySelector(".detail-container") ||
            document.querySelector("main");

        if (!target) {
            console.warn(
                "[Performer Header] Could not find insertion point"
            );
            return;
        }

        target.prepend(banner);
    }

    async function buildBanner() {

        if (buildInProgress) {
            return;
        }

        const performerId = getPerformerId();

        if (!performerId) {
            removeBanner();
            return;
        }

        if (document.getElementById(BANNER_ID)) {
            return;
        }

        buildInProgress = true;

        try {

            let selectedScenes;

            if (bannerCache.has(performerId)) {

                selectedScenes =
                    bannerCache.get(performerId);

            } else {

                const scenes =
                    await getPerformerSceneImages(
                        performerId
                    );

                if (!scenes.length) {
                    return;
                }

                selectedScenes =
                    shuffle(scenes).slice(0, 6);

                bannerCache.set(
                    performerId,
                    selectedScenes
                );
            }

            createBanner(selectedScenes);

        } finally {
            buildInProgress = false;
        }
    }

    function handleNavigation() {

        const performerId = getPerformerId();

        if (!performerId) {
            currentPerformerId = null;
            removeBanner();
            return;
        }

        if (performerId === currentPerformerId) {
            return;
        }

        currentPerformerId = performerId;

        removeBanner();

        setTimeout(buildBanner, 300);
    }

    const observer = new MutationObserver(() => {
        handleNavigation();
    });

    observer.observe(document.body, {
        subtree: true,
        childList: true,
    });

    window.addEventListener("popstate", () => {
        handleNavigation();
    });

    setTimeout(handleNavigation, 1000);

})();
