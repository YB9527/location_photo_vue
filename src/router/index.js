import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/HelloWorld'
import Admin from '@/components/admin/Admin'
import UserManager from '@/components/admin/UserManager'
import MapDatabaseManager from '@/components/admin/MapDatabaseManager'
import MapServerManager from '@/components/admin/MapServerManager'
import AreaSelect from '@/components/admin/AreaSelect'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/admin',
      name: 'Admin',
      component: Admin,
      children: [
        {
          path: 'usermanager',
          name: 'UserManager',
          component: UserManager,
        },
        {
          path: 'mapdatabasemanager',
          name: 'MapDatabaseManager',
          component: MapDatabaseManager,
        },
        {
          path: 'mapservermanager',
          name: 'MapServerManager',
          component: MapServerManager,
        },
        {
          path: 'areaselect',
          name: 'AreaSelect',
          component: AreaSelect,
        },
      ]
    },
    {
      path: '*',
      name: 'Admin',
      component: Admin
    },
  ]
})
