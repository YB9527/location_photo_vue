<template>
  <div>
    <div v-show="!show" style="margin-top: 20%;width: 600px;margin-left: 30%">
      <el-form label-width="300px">
        <el-form-item label="请输入后台密码:">
          <el-input v-model="password" show-password></el-input>
        </el-form-item>
        <el-form-item style="margin-top: 50px">
          <el-button type="info" @click="onSubmit">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-show="show">
      <div style="float: left" ref="element">
        <!--     <el-radio-group v-model="isCollapse" style="margin-bottom: 20px; ">
               <el-radio-button :label="false">展开</el-radio-button>
               <el-radio-button :label="true">收起</el-radio-button>
             </el-radio-group>-->
        <el-menu default-active="1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                 :style="menustyle"
                 :collapse="isCollapse">
          <el-menu-item index="1" @click="toPath('/admin/usermanager')">
            <i class="el-icon-user"></i>
            <span slot="title">用户管理</span>
          </el-menu-item>
          <el-menu-item index="2" @click="toPath('/admin/projectmanager')">
            <i class="el-icon-ice-cream-round"></i>
            <span slot="title">项目管理</span>
          </el-menu-item>
          <el-submenu index="3">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">地图</span>
            </template>
            <el-menu-item @click="toPath('/admin/mapdatabasemanager')">
              <i class="el-icon-coin"></i>
              <span slot="title">shp数据管理</span>
            </el-menu-item>
            <el-menu-item @click="toPath('/admin/mapservermanager')">
              <i class="el-icon-wind-power"></i>
              <span slot="title">服务管理</span>
            </el-menu-item>
            <el-menu-item @click="toPath('/admin/xzqymanager')">
              <i class="el-icon-ship"></i>
              <span slot="title">行政区域管理</span>
            </el-menu-item>
          </el-submenu>
          <el-menu-item index="3" style="margin-top: 100px" @click="closeOrOpenMenu()">
            <i :class="colseoropenmenu"></i>
          </el-menu-item>
        </el-menu>

      </div>
      <div :style="mainstyle">
        <router-view/>
      </div>
    </div>
  </div>
</template>

<script>
  import admintool from '@/public/admin/admintool';

  export default {
    name: "Admin",
    data() {
      return {
        password: "",
        show: false,
        isCollapse: true,
        element: "",
        menustyle: {},//
        mainstyle: {},
        colseoropenmenu: "el-icon-right",
      }
    },
    watch: {
      $route(to, from) {

      },
    },
    mounted() {


    },
    created() {

      this.menustyle.height = this.$store.getters.getWindowHeight - 10 + "px";
      this.mainstyle.float = "left";
      this.setMainWidth(true);
      this.show = this.$store.getters.isLoginAdmin;
      if (!this.show && this.$route.path !== "/admin") {
        this.$router.push({path: '/admin'})
      }


    },
    methods: {
      setMainWidth(ismax) {
        if (ismax) {
          this.mainstyle.width = this.$store.getters.getWindowWidth - 95 + "px";
        } else {
          this.mainstyle.width = this.$store.getters.getWindowWidth - 260 + "px";
        }
      },
      closeOrOpenMenu() {

        this.isCollapse = !this.isCollapse;
        if (this.isCollapse) {
          this.colseoropenmenu = "el-icon-right";
          this.setMainWidth(true);
        } else {
          this.colseoropenmenu = "el-icon-back";
          this.setMainWidth(false);
        }
      },
      onSubmit() {
        if (!this.password) {
          this.$store.commit("notify", {type: "error", message: "密码为空，请填写再登录", title: "登录提示"});
          return;
        }
       /* this.$store.commit("getCustom", {
          url: "xzdm/findall", callback: res => {

          }
        });*/

       /* this.$store.commit("postCustom",
          {
            url: admintool.getAdminUrl() + "login",
            po: {mark: "admin", password: this.password},
            callback: (resultdata) => {

            }
          });*/
        this.$store.commit("postCustom",
          {
            url:"admin/login",
            po: {mark: "admin", password: this.password},
            callback: (resultdata) => {
              if (resultdata.status == "Error") {
                this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message})
              } else if (resultdata.status == "Success") {
                this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: "登录成功"});
                this.show = true;
                this.$router.push({path: "/admin/usermanager"});
              }
            }
          });
      },
      handleOpen(key, keyPath) {
        console.log(key, keyPath);
      },
      handleClose(key, keyPath) {
        console.log(key, keyPath);
      },
      toPath(path) {
        console.log(path)
        if (this.$route.path != path) {
          this.$router.push({path: path});
        }
      }
    }

  }
</script>

<style scoped>
  .el-menu-vertical-demo:not(.el-menu--collapse) {
    width: 200px;
    height: 99%;
  }
</style>
