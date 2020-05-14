import Vue from 'vue'
import Router from 'vue-router'
import HelloWorld from '@/components/user/HelloWorld'
import Admin from '@/components/admin/Admin'
import UserManager from '@/components/admin/UserManager'
import MapDatabaseManager from '@/components/admin/MapDatabaseManager'
import MapServerManager from '@/components/admin/MapServerManager'
import AreaSelect from '@/components/admin/AreaSelect'
import XZQYManager from '@/components/admin/project/XZQYManager'
import MediaManager from '@/components/admin/project/MediaManager'
import DispatchTaskZJD from '@/components/admin/project/DispatchTaskZJD'
import ProjectManager from '@/components/admin/ProjectManager'
import User from '@/components/user/User'
import  olmap from '@/components/test/olmap'

Vue.use(Router);

export default new Router({
  //base: '/vue/',
  routes: [
    {
      path: '/user',
      name: 'User',
      component: User,
      children: [
        {
          path: 'helloworld',
          name: 'HelloWorld',
          component: HelloWorld,
        },
        {
          path: 'olmap',
          name: 'olmap',
          component: olmap,
        },
      ]
    },
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
        {
          path: 'xzqymanager',
          name: 'XZQYManager',
          component: XZQYManager,

        },
        {
          path: 'projectmanager',
          name: 'ProjectManager',
          component: ProjectManager,

        },
        /*{
          path: 'project',
          name: 'Project',
          component: Project,
          children: [
            {

              path: 'xzqymanager',
              name: 'XZQYManager',
              component: XZQYManager,


            },
            {
              path: 'mediaManager',
              name: 'MediaManager',
              component: MediaManager,
            },
          ]

        }*/
      ]
    },
    {
      path: '*',
      name: 'Admin',
      component: Admin
    },
  ]
})
