cd项目权限控制

# Usage

1 安装snpm依赖包

```bash
$ npm install @suning/cd-perm --save
```

2 修改snCommon.js文件

```js
import permission from '@suning/cd-perm';

INCLUDE_ALL_MODULES(
    [
        ...
        permission
    ],
    app);
```

3 修改需要设置权限的html页面

3.1 控制权限，使用perm-code指令，perm-code为资源码

```html
<div class="form-group">
    <button class="btn btn-default" ng-click="search()"" perm-code="gdgsdgsdfg">查询</button>
</div>
```

3.2 数据权限，同时使用perm-code和perm-data指令，perm-code为资源码，perm-data为当前scope，在该scope上必须要有isMajorData、entityTypeName、entityId、permissionInfos等权限属性。perm-data指令同时会劫持ng-click指向的function，在点击事件执行时设置http头部缓存，之后发送的http请求会带上权限头部。

```html
<tr ng-repeat="gitrepos in reposlist">
    <td style="min-width: 50px;">
        <a href="/#/reposDetail/{{gitrepos.id}}" perm-data="gitrepos" perm-code="reposDetail">详情</a>
        <a ng-if="gitrepos.status != 'D'"  href="/#/editRepos/{{gitrepos.id}}" perm-data="gitrepos" perm-code="editRepos">修改</a>
        <a ng-if="gitrepos.status != 'D'" href="javascript:;" ng-click="deleteRepos(gitrepos.id)" perm-data="gitrepos" perm-code="abandon">废弃</a>
        <a ng-if="gitrepos.status != 'D'"  href="javascript:;" ng-click="baseinfo(gitrepos.id)" perm-data="gitrepos" perm-code="baseInfo">基本设置</a>
    </td>
</tr>
```

4 Json数据控制

1 在对应json数据上添加resourceCode字段
2 调用JsonPerm服务，传入修改过的json数据

```js
menus.splice(vm.getMenusIndex("19"), 0, { code: "19-0", name: "可视化管理", icon: "fa icon-document", state: "Console.Visualable", href: odincodeDeposit + '/#/visualable',resourceCode:'new_actionset1' });
menus.splice(vm.getMenusIndex("19-0"), 0, { code: "19-1", name: "我的步骤集", icon: "fa icon-document", state: "Console.navheadDetail.ActionSetList", href: odincodeDeposit + '/#/actionSetList',resourceCode:'new_actionset1' });

JsonPerm($scope.menus)
```

# Version

## 0.0.13

支持控制权限和数据权限