<template>
  <div>
    <h3>
      用户管理界面
    </h3>
    <div>
      <el-table
        :data="users"
        height="250"
        border
        style="width: 100%">
        <el-table-column
          type="index"
          label="序号"
          width="60px"
        >
          <template slot-scope="scope">
            {{scope.$index +1}}
          </template>
        </el-table-column>
        <el-table-column
          prop="account"
          label="用户账号"
          width="180">
        </el-table-column>
        <el-table-column
          prop="nickName"
          label="昵称"
          width="180">
        </el-table-column>
        <el-table-column
          prop="password"
          label="密码">
        </el-table-column>
        <el-table-column
          prop="registDate"
          label="注册日期">
          <template slot-scope="scope">{{ scope.row.registDate | dateFormat }}</template>
        </el-table-column>
        <el-table-column
          prop="userLevel"
          label="角色级别">
          <template slot-scope="scope">{{ scope.row.level | levelFormat(levels) }}</template>
        </el-table-column>
        <el-table-column
          prop="email"
          label="邮箱">
        </el-table-column>
        <el-table-column
          label="操作"
          width="280">
          <template slot-scope="scope">
            <el-button type="info" @click="showDiloagEditUser(scope.row)" plain>编辑</el-button>
            <el-button type="info" v-show="!scope.row.level" @click="showDiloagAgreeUser(scope.row)" plain>同意注册
            </el-button>
          </template>
        </el-table-column>

      </el-table>

    </div>
    <div>
      <el-dialog title="编辑用户" :visible.sync="edituserDialogFormVisible" width="400px">
        <el-form :model="user">
          <el-form-item label="账号" :label-width="formLabelWidth">
            <el-input :disabled="true" v-model="user.account"></el-input>
          </el-form-item>
          <el-form-item label="昵称" :label-width="formLabelWidth">
            <el-input v-model="user.nickName"></el-input>
          </el-form-item>
          <el-form-item label="密码" :label-width="formLabelWidth">
            <el-input v-model="user.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" :label-width="formLabelWidth">
            <el-input v-model="user.email"></el-input>
          </el-form-item>
          <el-form-item label="级别" :label-width="formLabelWidth">
            <el-select v-model="user.level" clearable placeholder="请选择" style="width: 300px">
              <el-option
                v-for="level in levels"
                :key="level.levelNum"
                :label="level.describe"
                :value="level.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="edituserDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitEditUser(user)">确 定</el-button>
        </div>
      </el-dialog>
      <el-dialog title="赋予用户级别" :visible.sync="agreeUserDialogFormVisible" width="400px">
        <el-form :model="user">
          <el-form-item label="账号" :label-width="formLabelWidth">
            <el-input :disabled="true" v-model="user.account"></el-input>
          </el-form-item>
          <el-form-item label="昵称" :label-width="formLabelWidth">
            <el-input :disabled="true" v-model="user.nickName"></el-input>
          </el-form-item>
          <el-form-item label="密码" :label-width="formLabelWidth">
            <el-input :disabled="true" v-model="user.password"></el-input>
          </el-form-item>
          <el-form-item label="邮箱" :label-width="formLabelWidth">
            <el-input :disabled="true" v-model="user.email"></el-input>
          </el-form-item>
          <el-form-item label="级别" :label-width="formLabelWidth">
            <el-select v-model="user.level" clearable placeholder="请选择" style="width: 300px">
              <el-option
                v-for="level in levels"
                :key="level.levelNum"
                :label="level.describe"
                :value="level.name">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="agreeUserDialogFormVisible = false">取 消</el-button>
          <el-button type="primary" @click="submitUserLevel(user)">同 意</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import admintool from '@/public/admin/admintool';

  export default {
    name: "UserManager",
    data() {
      return {
        users: [],//表格要显示的user
        user: {},//当前要处理的user,是副本
        formLabelWidth: '60px',
        edituserDialogFormVisible: false,
        agreeUserDialogFormVisible: false,
        levels: [],
      }
    },
    filters: {
      levelFormat(userLevel, levels) {

        if (userLevel) {
          for (let level of levels) {
            if (level.name === userLevel) {
              return level.describe;
            }
          }
        } else {
          return "";
        }
      }
    },
    created() {
      this.$store.commit("getCustom", {
        url: admintool.getUserUrl() + "findlevels", callback: (resultdata) => {
          if (resultdata.status === "Success") {
            if (resultdata.json != null) {
              let levels = JSON.parse(resultdata.json);
              this.levels = levels;
            }
          } else {
            this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message})
          }
        }
      });

      this.$store.commit("getCustom", {
        url: admintool.getUserUrl() + "findusers", callback: (resultdata) => {
          if (resultdata.status === "Success") {
            if (resultdata.json != null) {
              let users = JSON.parse(resultdata.json);
              this.setUsersLevel(users);
              this.users = users;
            }
          } else {
            this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message})
          }
        }
      });
    },
    methods: {

      setUsersLevel(users) {
        if (users) {
          for (let user of users) {
            this.setUserLevel(user);
          }
        }
      },
      /**
       * 设置用户 在 vue 中 能够识别的级别
       * @param user
       */
      setUserLevel(user) {
        let userLevel = user.userLevel;
        if (userLevel) {
          user.level = userLevel.level;
        }
      },
      /**
       * 弹出用户 编辑窗口
       * @param user
       */
      showDiloagEditUser(user) {
        this.user = JSON.parse(JSON.stringify(user));
        this.edituserDialogFormVisible = true;
      },

      /**
       * 提交 编辑的user 到数据保存
       * @param user
       */
      submitEditUser(user) {


        if (!user.level) {
          this.$store.commit("showMessageBox", {type: "error", message: "请分配级别！！！"})
          return;
        }

        let id = user.id;
        for (let i = 0; i < this.users.length; i++) {
          if (this.users [i].id == id) {
            if (JSON.stringify(this.users [i]) !== JSON.stringify(user)) {
              //如果 user 被改变了 才保存到数据库
              this.$store.commit("postCustom", {
                url: admintool.getUserUrl() + "edituser", po: user, callback: resultData => {
                  if (resultData.status === "Success") {
                    //关闭窗口
                    this.edituserDialogFormVisible = false;
                    this.agreeUserDialogFormVisible = false;
                    this.users.splice(i, 1, user);

                    this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "编辑成功！！！"});
                  } else {
                    this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: resultData.message});
                  }
                }
              })
            }
          }
        }
      },
      /**
       * 弹出 同意用户注册窗口
       * @param user
       */
      showDiloagAgreeUser(user) {
        this.user = JSON.parse(JSON.stringify(user));
        this.agreeUserDialogFormVisible = true;
      },
      /**
       * 同意 用户注册
       * @param user
       */
      submitUserLevel(user) {
        this.submitEditUser(user)
      },
    }

  }
</script>

<style scoped>

</style>
