import { world } from "./world.js"
    let geomerty;
    let material;
    let mesh;
    
    geomerty = new THREE.SphereGeometry(5, 16, 16);
    material = new THREE.MeshBasicMaterial({color: 0x00aaff, visible: false})
   


export let player =  {
        mesh:{
            startPosition: {
                x: -world.MAP_SIZE / 2 + world.INITIAL_DISTANCE,
                y: world.PLAYER_HEIGHT,
                },
            geomerty: geomerty,
            material: material,
        },
        
        canShoot: false,
        canJump: true,
        score: {
            spitfire: 0,
            devotionWithTurbocharger: 0,
            devotionWithoutTurbocharger: 0,
            r99: 0,
            alternator: 0,
            r301: 0,
            flatline: 0,
            havocWithTurbocharger: 0,
            HavocWithoutTurbocharger: 0,
            re45: 0
        }
}
