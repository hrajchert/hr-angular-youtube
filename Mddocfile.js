
module.exports = function(mddoc) {
    mddoc.initConfig({
        'inputDir' : 'docs',
        'inputExclude': 'bower_components',

    });

    mddoc.addGenerator('mddoc-angular-generator', {
        'title' : 'hr-angular-youtube',
        'modules' : ['demo','treeControl'],
//        'modules' : ['demo','demoOverlay', 'demoControls'],

        'inject-scripts' : [
            'dist/hr-angular-youtube-tpl.js',
            'dist/hrAngularExtend.js',
            'demo/controls/controls.js',
            'demo/fullscreen/fullscreen.js',
            'demo/overlay/overlay.js',
            'demo/marker/marker.js',
            'demo/assets/screenfull.min.js'
        ],
        'inject-styles'  : [
            'dist/hr-angular-youtube.css',
            'demo/overlay/overlay.css',
            'demo/marker/marker.css',
            'demo/assets/font-awesome/css/font-awesome.min.css'
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
                        'name' : 'Fullscreen',
                        'link' : '/demo/fullscreen'
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
            },
            {
                'name' : 'Developer',
                'link' : '/dev',
                'menu' : [
                    {
                        'name' : 'Code view',
                        'link' : '/dev/code'
                    }
                ]
            }
        ]
    });

    mddoc.addGenerator('mddoc-code-browser-generator', {
        'exclude' : ['node_modules', '.git', '.DS_Store']
    });

};
