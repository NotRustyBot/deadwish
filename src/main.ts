import { Application, Assets } from "pixi.js";
import { Game } from "./game";
import bundle from "./bundle.json";
import soundBundle from "./bundle_sound.json";
import "./style/style.css";
import "./style/notebook.css";
import "./style/chat.css";
import "./style/symbols.css";
import { sound } from "@pixi/sound";




(async () => {
    const app = new Application();
    await app.init({ background: "#000", resizeTo: document.body, antialias: true, backgroundAlpha: 0 });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    /*for (const key in bundle) {
        Assets.add({ alias: key, src: "img/" + bundle[key as keyof typeof bundle] });
    }*/

    Assets.init({ manifest: { bundles: [soundBundle, bundle] } });
    await Assets.loadBundle("bundle_sound");
    await Assets.loadBundle("bundle");

    sound.volumeAll = 0.2;


    //await Assets.load(Object.keys(bundle));

    const robotoSlab = new FontFace("Roboto Slab", "url('./RobotoSlab-VariableFont_wght.ttf')");
    const eBGaramond = new FontFace("EB Garamond", "url('./EBGaramond-VariableFont_wght.ttf')");
    const caveat = new FontFace("Caveat", "url('./Caveat-VariableFont_wght.ttf')");

    await Promise.all([robotoSlab.load(), eBGaramond.load(), caveat.load()]);

    document.fonts.add(robotoSlab);
    document.fonts.add(eBGaramond);
    document.fonts.add(caveat);

    const game = new Game(app);
    game.init();

})();


function adjustForAspectRatio() {
    const container = document.body; // or your specific container element
    const targetRatio = 16 / 9;
    const currentRatio = window.innerWidth / window.innerHeight;

    if (currentRatio < targetRatio) {
        // Screen is taller than 16:9 - need to scale down
        const scale = currentRatio / targetRatio;
        container.style.transform = `scale(${scale})`;
        container.style.transformOrigin = 'left center';
        container.style.width = `${100 / scale}%`;
        container.style.height = `${100 / scale}%`;
        container.style.margin = '0 auto';
        container.style.overflow = 'hidden';
    } else {
        // Reset if screen is wide enough
        container.style.transform = '';
        container.style.width = '';
        container.style.height = '';
        container.style.margin = '';
        container.style.overflow = '';
    }
}

window.addEventListener('load', adjustForAspectRatio);
window.addEventListener('resize', adjustForAspectRatio);