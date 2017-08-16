'use strict';

exports.__esModule = true;

exports.default = function (app) {
    app.factory('UserPerm', ['permName', 'HttpService', 'User', '$q', 'HttpSetting', function (permName, HttpService, User, $q, HttpSetting) {
        var isInit = false,
            deferred = $q.defer();

        User.then(function (_ref) {
            var data = _ref.data;

            if (permName == 'odin') {
                HttpService.get('permission/list/').then(function (d) {
                    isInit = true;
                    d.forEach(function (e) {
                        HttpSetting.add(e.resourceUrl, {
                            isMajorData: 0,
                            resourceCode: e.resourceCode
                        });
                    });
                    deferred.resolve(d);
                }, function (d) {
                    deferred.reject(d);
                }).catch(function (e) {
                    console.log(e);
                });
            } else {
                HttpService.get('cupid/loadPermissionByPlatform/' + data.principal + permName.slice(0, permName.length - 1)).then(function (d) {
                    isInit = true;
                    d.forEach(function (e) {
                        HttpSetting.add(e.resourceUrl, {
                            isMajorData: 0,
                            resourceCode: e.resourceCode
                        });
                    });
                    deferred.resolve(d);
                }, function (d) {
                    deferred.reject(d);
                }).catch(function (e) {
                    console.log(e);
                });
            }
        }, function () {
            deferred.reject();
        }).catch(function (e) {
            console.log(e);
        });
        return deferred.promise;
    }]);

    //Json权限
    app.factory('JsonPerm', ['UserPerm', function (UserPerm) {
        return function (arr) {
            return UserPerm.then(setArr, rejectArr).catch(function (e) {
                console.log(e);
            });

            function setArr(d) {
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].hasOwnProperty('resourceCode')) {
                        var r = d.find(function (e) {
                            return e.resourceCode === arr[j].resourceCode;
                        });
                        if (!r) {
                            arr.splice(j--, 1);
                        }
                    }
                }
            }

            function rejectArr(d) {
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].hasOwnProperty('resourceCode')) {
                        arr.splice(j--, 1);
                    }
                }
            }
        };
    }]);

    app.directive('permCode', ['$http', 'HttpSetting', 'UserPerm', function ($http, HttpSetting, UserPerm) {
        return {
            restrict: 'A',
            scope: false,
            link: function link($scope, element, attr) {
                if (attr.permData) {
                    //数据权限
                    var resourceCodes = eval('$scope.' + attr.permData + '.resourceCodes');
                    if (resourceCodes && resourceCodes.indexOf(attr.permCode) === -1) {
                        element.css({
                            display: 'none'
                        });
                    }

                    if (attr.ngClick) {
                        var nextUrl = eval('$scope.' + attr.permData + '.permissionInfos && $scope.' + attr.permData + '.permissionInfos.' + attr.permCode);
                        if (nextUrl) {
                            var clickName = attr.ngClick.trim().split('(')[0];
                            var tmp = '\n                                $scope.' + clickName + '=(function(self,{entityTypeName,entityId,isMajorData},attr, HttpSetting,nextUrl){\n                                    return function(){\n                                        HttpSetting.add(nextUrl, {\n                                            entityTypeName,\n                                            entityId,\n                                            isMajorData,\n                                            resourceCode:attr.permCode\n                                        })\n                                        self.apply(null,arguments)\n                                    }\n                                })($scope.' + clickName + ',$scope.' + attr.permData + ',attr,HttpSetting,nextUrl)';
                            eval(tmp);
                        }
                    }
                } else {
                    //控制权限
                    element.css({
                        display: 'none'
                    });
                    UserPerm.then(function (d) {
                        d.forEach(function (e) {
                            if (e.resourceCode === attr.permCode) {
                                element.css({
                                    display: ''
                                });
                            }
                        });
                    }, function (d) {
                        console.log(d);
                    }).catch(function (e) {
                        console.log(e);
                    });
                }
            }
        };
    }]);
};
//# sourceMappingURL=perm.js.map