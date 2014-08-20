
module.exports = function(mddoc) {
    mddoc.initConfig({
        'inputDir' : 'docs',
        'inputExclude': 'bower_components',

    });

    mddoc.addGenerator('mddoc-angular-generator', {
        'title' : 'hr-angular-youtube',
        'modules' : ['demo'],
//        'modules' : ['demo','demoOverlay', 'demoControls'],

        'scripts' : [
            '/dist/hr-angular-youtube.js',
            '/demo/controls/controls.js',
            '/demo/overlay/overlay.js',
            '/demo/marker/marker.js',
            '/demo/assets/screenfull.min.js'
        ],
        'styles'  : [
            '/dist/hr-angular-youtube.css',
            '/demo/overlay/overlay.css',
            '/demo/assets/font-awesome/css/font-awesome.min.css'
        ],
        'menu' : [
            {
                'name' : 'Home',
                'link' : '/'
            },
            {
                'name' : 'Demo',
                'link' : '/demo',
                'menu' : [
                    {
                        'name' : 'Basic',
                        'link' : '/demo/basic'
                    },
                    {
                        'name' : 'Controls',
                        'link' : '/demo/controls'
                    },
                    {
                        'name' : 'Overlay',
                        'link' : '/demo/overlay'
                    },
                    {
                        'name' : 'Marker',
                        'link' : '/demo/marker'
                    }
                ]
            }
        ]
    });

    mddoc.addGenerator('mddoc-code-browser-generator', {
    });

};
