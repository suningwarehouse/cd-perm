export default function (app) {
    app.factory('UserPerm', ['permName', 'HttpService', 'User', '$q', 'HttpSetting', function (permName, HttpService, User, $q, HttpSetting) {
        let isInit = false,
            deferred = $q.defer();

        User.then(({
            data
        }) => {
            if(permName == 'odin'){
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
            }else{
            HttpService.get('cupid/loadPermissionByPlatform/' + data.principal + permName.slice(0, permName.length - 1)).then(d => {
                isInit = true
                d.forEach(e => {
                    HttpSetting.add(e.resourceUrl, {
                        isMajorData: 0,
                        resourceCode: e.resourceCode
                    })
                })
                deferred.resolve(d)
            }, d => {
                deferred.reject(d)
            }).catch(e => {
                console.log(e)
            })
            }
        }, () => {
            deferred.reject()
        }).catch(e => {
            console.log(e)
        })
        return deferred.promise
    }])

    //Json权限
    app.factory('JsonPerm', ['UserPerm', function (UserPerm) {
        return function (arr) {
            return UserPerm.then(setArr, rejectArr).catch(e => {
                console.log(e)
            })

            function setArr(d) {
                for (var j = 0; j < arr.length; j++) {
                    if (arr[j].hasOwnProperty('resourceCode')) {
                        let r = d.find(e => {
                            return e.resourceCode === arr[j].resourceCode
                        })
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
        }
    }])

    app.directive('permCode', ['$http', 'HttpSetting', 'UserPerm', function ($http, HttpSetting, UserPerm) {
        return {
            restrict: 'A',
            scope: false,
            link: function ($scope, element, attr) {
                if (attr.permData) {
                    //数据权限
                    let resourceCodes = eval(`$scope.${attr.permData}.resourceCodes`)
                    if (resourceCodes && resourceCodes.indexOf(attr.permCode) === -1) {
                        element.css({
                            display: 'none'
                        })
                    }

                    if (attr.ngClick) {
                        let nextUrl = eval(`$scope.${attr.permData}.permissionInfos && $scope.${attr.permData}.permissionInfos.${attr.permCode}`)
                        if (nextUrl) {
                            let clickName = attr.ngClick.trim().split('(')[0]
                            let tmp = `
                                $scope.${clickName}=(function(self,{entityTypeName,entityId,isMajorData},attr, HttpSetting,nextUrl){
                                    return function(){
                                        HttpSetting.add(nextUrl, {
                                            entityTypeName,
                                            entityId,
                                            isMajorData,
                                            resourceCode:attr.permCode
                                        })
                                        self.apply(null,arguments)
                                    }
                                })($scope.${clickName},$scope.${attr.permData},attr,HttpSetting,nextUrl)`
                            eval(tmp)
                        }
                    }
                } else {
                    //控制权限
                    element.css({
                        display: 'none'
                    })
                    UserPerm.then(d => {
                        d.forEach(e => {
                            if (e.resourceCode === attr.permCode) {
                                element.css({
                                    display: ''
                                })
                            }
                        })
                    }, d => {
                        console.log(d)
                    }).catch(e => {
                        console.log(e)
                    })
                }
            }
        }
    }]);
}