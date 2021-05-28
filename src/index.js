const { Color, Vec3, Xfo, Scene, GLRenderer, CameraManipulator } =
  window.zeaEngine;
const { SliderHandle } = window.zeaUx;
const { CADAsset, CADBody, PMIView } = window.zeaCad;

const scene = new Scene();
// scene.setupGrid(100.0, 10);

const renderer = new GLRenderer(document.getElementById("canvas"), {
  webglOptions: {
    antialias: true,
    canvasPosition: "relative",
  },
});
const cameraManipulator = renderer.getViewport().getManipulator();
cameraManipulator.setDefaultManipulationMode(
  CameraManipulator.MANIPULATION_MODES.trackball
);

renderer.outlineThickness = 1;
renderer.outlineColor = new Color(0.2, 0.2, 0.2, 1);
// const envMap = new EnvMap();
// envMap
//   .getParameter("FilePath")
//   .setValue("http://127.0.0.1:8080/data/StudioG.zenv");
// scene.setEnvMap(envMap);

renderer.setScene(scene);

////////////////////////////////////
// Setup the right side Scene Tree view.
const { SelectionManager } = window.zeaUx;

const appData = {
  scene,
  renderer,
};

const selectionManager = new SelectionManager(appData, {
  enableXfoHandles: true,
});

appData.selectionManager = selectionManager;

// // Note: the alpha value determines  the fill of the highlight.
const selectionColor = new Color("#F9CE03");
selectionColor.a = 0.1;
const subtreeColor = selectionColor.lerp(new Color(1, 1, 1, 0), 0.5);
selectionManager.selectionGroup
  .getParameter("HighlightColor")
  .setValue(selectionColor);
selectionManager.selectionGroup
  .getParameter("SubtreeHighlightColor")
  .setValue(subtreeColor);

const sceneTreeView = document.getElementById("scene-tree-view");
if (sceneTreeView) {
  sceneTreeView.selectionManager = selectionManager;
  sceneTreeView.items = [];
}

selectionManager.on("leadSelectionChanged", (event) => {
  const { treeItem } = event;
  if (treeItem instanceof PMIView) {
    console.log("PMIView:", treeItem.getPath());
    const pmiView = treeItem;
    const camera = renderer.getViewport().getCamera();
    pmiView.activate(camera);
  }
});

////////////////////////////////////
// Display the Fps
import "./zea-fps-display.js";
const fpsDisplay = document.getElementById("fps");
if (fpsDisplay) fpsDisplay.renderer = renderer;

////////////////////////////////////
// CAD Asset

const asset = new CADAsset();
if (window.ZCAD_URL) {
  asset.load(window.ZCAD_URL).then(() => {
    const materials = asset.getMaterialLibrary().getMaterials();
    // materials.forEach((material) => {
    //   if (material.getShaderName() == "StandardSurfaceShader") {
    //     material.setShaderName("FlatSurfaceShader");
    //   }
    // });

    sceneTreeView.setTreeItem(asset, appData);
    renderer.frameAll();
  });
}

scene.getRoot().addChild(asset);

////////////////////////////////////
// CAD Asset
import "./scene-tree-view.js";
