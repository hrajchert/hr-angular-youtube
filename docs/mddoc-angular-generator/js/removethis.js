/* global angular */
angular.module('demo')
.directive('mdcFileTree',[ function() {
    return {
        restrict: 'EA',
        scope: {
            'files' : '='
        },
        template:
                '<ul>'+
                '   <mdc-file-tree-node file="files">'+
                '   </mdc-file-tree-node>' +
                '</ul>',
        link: function(scope) {
            scope.$watch('files', function (n) {
                if (n) {
                    console.log('LALA',scope.files);
                }

            });
        }
    };
}])
.directive('mdcFileTreeNode',[ function() {
    return {
        restrict: 'EA',
        scope: {
            'file' : '='
        },
        replace: true,
        template:
                '<li><i ng-class="file.getIconClass()"></i>{{::file.name}}' +
                '    <ul ng-if="file.hasChilds()">Tienehijos' +
//                '       <mdc-file-tree-node ng-repeat="f in file.getChilds()" file="f">'+
//                '       </mdc-file-tree-node>' +
//                '<mdc-file-tree-node file="file.getChilds()[0]"></mdc-file-tree-node>' +
                '    </ul>' +
                '</li>',
        link: function(/*scope*/) {
            /*scope.$watch('file', function (n) {
                if (n) {
                    console.log('hh',scope.file.getChilds());

                }
            });*/
        }
    };
}])

.controller('blahCtrl', ['$http','$scope', function($http, $scope) {
    $http.get('data/dir-structure.json').then(function(response) {
        var includeBlah = function (dest, what) {
            if (what.length === 1) {
                dest.child.name = what[0];
            } else {

            }
        };
        var explodeDir = function (plainFiles) {
            var files = {name: '.', child: {}},
                e = [];
            for (var i=0; i<plainFiles.length; i++) {
                e = plainFiles[i].split('/');
                includeBlah(files, e);
            }
            return files;
        };
        explodeDir(response.data);

        // .
        // .env
        // assets
        //     a
        //       a1
        //     b
        //     c



//        $scope.files = response.data;
        var TreeFolder = function(name) {
            this.name = name;
            this.childs = [];
        };

        TreeFolder.prototype.getIconClass = function () {
            return 'fa fa-folder-o';
        };

        TreeFolder.prototype.hasChilds = function() {
            return this.childs.length > 0;
        };

        TreeFolder.prototype.addChild = function (child) {
            this.childs.push(child);
            return this;
        };
        TreeFolder.prototype.getChilds = function () {
            return this.childs;
        };


        var TreeFile = function (name) {
            this.name = name;
        };

        TreeFile.prototype.getIconClass = function () {
            return 'fa fa-file-o';
        };

        TreeFile.prototype.hasChild = function() {
            return false;
        };

        $scope.files3 = new TreeFolder('.')
            .addChild(new TreeFile('.env'))
            .addChild(new TreeFolder('assets')
                .addChild(new TreeFolder('a').addChild(new TreeFile('a1.txt')))
                .addChild(new TreeFolder('b'))
                .addChild(new TreeFile('c.txt'))
            );
//        console.log($scope.files.name);

        $scope.files2 = ['.',
            '.env',
            ['assets', ['a', 'a1'], 'b', 'c']
        ];

        $scope.fileOptions = {
            nodeChildren: "children",
            dirSelectable: true,
            isLeaf: function (node) {
                return node.children.length === 0;
            },
            equality: function (node1, node2) {
                return node1 === node2;
            },
            injectClasses: {
                ul: "a1",
                li: "a2",
                liSelected: "a7",
                iExpanded: "a3",
                iCollapsed: "a4",
                iLeaf: "a5",
                label: "a6",
                labelSelected: "a8"
            }
        }

        $scope.files = [
            {name: '.', children : [
                {name: '.env', children:[]},
                {name: 'assets', children: [
                    { name: 'a', children: [{name: 'a1', children: []}]},
                        {name: 'b', children: []},
                        {name: 'c', children: []}
                    ]
                }
            ]
        }];
        console.log($scope.files);
    },
    function(err) {
        console.log('oh no', err);
    });
}]);
