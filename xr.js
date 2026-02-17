/* ENABLE AR
---------------------------------------------------------------------------------------------------- */
const xr = await scene.createDefaultXRExperienceAsync({
    uiOptions: {
        sessionMode: "immersive-ar",
        referenceSpaceType: "local-floor" // FIXED TYPO
    },
    optionalFeatures: ["hit-test", "anchors"]
});

/* HIT-TEST
---------------------------------------------------------------------------------------------------- */
const fm = xr.baseExperience.featuresManager;

// Enable hit-test correctly
const hitTest = fm.enableFeature(BABYLON.WebXRHitTest, "latest");

// Create marker
const marker = BABYLON.MeshBuilder.CreateCylinder("marker", {
    diameter: 0.15,
    height: 0.01
}, scene);

marker.rotationQuaternion = new BABYLON.Quaternion();
marker.isVisible = false;

// Marker material (FIXED material bug)
const markerMat = new BABYLON.StandardMaterial("markerMat", scene);
markerMat.diffuseColor = new BABYLON.Color3(0, 1, 0);
markerMat.alpha = 0.5;
marker.material = markerMat;

let lastHitTest = null;

hitTest.onHitTestResultObservable.add((results) => {
    if (results.length) {
        marker.isVisible = true;
        lastHitTest = results[0];

        lastHitTest.transformationMatrix.decompose(
            undefined,
            marker.rotationQuaternion,
            marker.position
        );
    } else {
        marker.isVisible = false;
        lastHitTest = null;
    }
});

/* ANCHORS
---------------------------------------------------------------------------------------------------- */
// FIXED typo: WebXRAnchorSystem
const anchorSystem = fm.enableFeature(BABYLON.WebXRAnchorSystem, "latest");

scene.onPointerDown = async () => {
    if (lastHitTest && marker.isVisible) {

        const anchor = await anchorSystem.addAnchorPointUsingHitTestResultsAsync(lastHitTest);

        const mesh = buildRandomMesh();

        anchor.attachedNode = mesh;
    }
};


/* RANDOM SHAPE GENERATOR
---------------------------------------------------------------------------------------------------- */

function buildRandomMesh() {

    const size = BABYLON.Scalar.RandomRange(0.07, 0.25); // not too small or huge
    const shapeType = Math.floor(Math.random() * 4);

    let mesh;

    switch (shapeType) {

        case 0:
            mesh = BABYLON.MeshBuilder.CreateBox("box", { size: size }, scene);
            break;

        case 1:
            mesh = BABYLON.MeshBuilder.CreateSphere("sphere", {
                diameter: size
            }, scene);
            break;

        case 2:
            mesh = BABYLON.MeshBuilder.CreateCylinder("cylinder", {
                height: size,
                diameter: size * 0.8
            }, scene);
            break;

        case 3:
            mesh = BABYLON.MeshBuilder.CreateTorus("torus", {
                diameter: size,
                thickness: size * 0.3
            }, scene);
            break;
    }

    // Lift mesh so it sits on surface properly
    mesh.position.y = size / 2;
    mesh.bakeCurrentTransformIntoVertices();

    // Random colour
    const mat = new BABYLON.StandardMaterial("mat", scene);
    mat.diffuseColor = new BABYLON.Color3(
        Math.random(),
        Math.random(),
        Math.random()
    );

    mesh.material = mat;

    return mesh;
}
