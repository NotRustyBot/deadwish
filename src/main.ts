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
    await app.init({ background: "#000", resizeTo: window, antialias: true,backgroundAlpha:0 });
    document.getElementById("pixi-container")!.appendChild(app.canvas);

    /*for (const key in bundle) {
        Assets.add({ alias: key, src: "img/" + bundle[key as keyof typeof bundle] });
    }*/

    Assets.init({ manifest: { bundles: [soundBundle, bundle] } });
    await Assets.loadBundle("bundle_sound");
    await Assets.loadBundle("bundle");

    sound.volumeAll = 0.2;


    //await Assets.load(Object.keys(bundle));

    const caveat = new FontFace("Caveat", "url('./Caveat-VariableFont_wght.ttf')");
    await caveat.load();
    document.fonts.add(caveat);

    const game = new Game(app);
    game.init();

})();
