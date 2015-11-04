System.config({
    map: {
        traceur: 'systemjs/traceur.min.js'
    },
    transpiler: 'traceur'
});

System.import('app/app.js');