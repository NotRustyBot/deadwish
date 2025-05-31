import { Application, Assets } from "pixi.js";
import { Game } from "./game";
import bundle from "./bundle.json";
import "./style.css";



(async () => {
  const app = new Application();
  await app.init({ background: "#000", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  for (const key in bundle) {
    Assets.add({ alias: key, src: "img/" + bundle[key as keyof typeof bundle] });
  }

  await Assets.load(Object.keys(bundle));


  const caveat = new FontFace("Caveat", "url('./Caveat-VariableFont_wght.ttf')");
  await caveat.load();
  document.fonts.add(caveat);

  const game = new Game(app);
  game.init();

})();
