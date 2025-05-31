import { Application, Assets } from "pixi.js";
import { Game } from "./game";
import bundle from "./bundle.json";



(async () => {
  const app = new Application();
  await app.init({ background: "#000", resizeTo: window, antialias: true });
  document.getElementById("pixi-container")!.appendChild(app.canvas);

  for (const key in bundle) {
    Assets.add({ alias: key, src: "img/" + bundle[key as keyof typeof bundle] });
  }

  await Assets.load(Object.keys(bundle));

  /*
  const rubik = new FontFace("Rubik", "url('./Rubik-Regular.ttf')");
  await rubik.load();
  document.fonts.add(rubik);
  */

  const game = new Game(app);
  game.init();

})();
