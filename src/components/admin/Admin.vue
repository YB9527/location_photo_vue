<template>
  <div>
    <div v-show="!show" style="margin-top: 20%;width: 600px;margin-left: 30%">
      <el-form label-width="300px">
        <el-form-item label="请输入后台密码:">
          <el-input v-model="password" show-password></el-input>
        </el-form-item>
        <el-form-item style="margin-top: 50px">
          <el-button type="info" @click="onSubmit">立即创建</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div v-show="show">
      <div style="float: left;width: 10%">
        <el-radio-group v-model="isCollapse" style="margin-bottom: 20px;">
          <el-radio-button :label="false">展开</el-radio-button>
          <el-radio-button :label="true">收起</el-radio-button>
        </el-radio-group>
        <el-menu default-active="1" class="el-menu-vertical-demo" @open="handleOpen" @close="handleClose"
                 :collapse="isCollapse">
          <el-menu-item index="1" @click="toPath('/admin/usermanager')">
            <i class="el-icon-user" ></i>
            <span slot="title" >用户管理</span>
          </el-menu-item>
          <el-submenu index="2">
            <template slot="title">
              <i class="el-icon-location"></i>
              <span slot="title">地图</span>
            </template>
            <el-menu-item  @click="toPath('/admin/mapdatabasemanager')">
              <i class="el-icon-coin" ></i>
              <span slot="title">数据管理</span>
            </el-menu-item>
            <el-menu-item  @click="toPath('/admin/mapservermanager')">
              <i class="el-icon-wind-power" ></i>
              <span slot="title">服务管理</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </div>
      <div>
        <router-view />
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
      }
    },
    watch: {
      $route(to, from) {

      },
    },
    mounted() {

    },
    created() {
      this.show = this.$store.getters.isLoginAdmin;
      if (!this.show && this.$route.path !== "/admin") {
        this.$router.push({path: '/admin'})
      }
    },
    methods: {
      onSubmit() {
        if (!this.password) {
          this.$store.commit("notify", {type: "error", message: "密码为空，请填写再登录", title: "登录提示"});
          return;
        }
        this.$store.commit("postCustom",
          {
            url: admintool.getAdminUrl() + "login",
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
