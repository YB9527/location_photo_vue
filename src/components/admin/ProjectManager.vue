<template>
  <div>
    <div v-show="showprojectmanager">
      <h3>
        项目管理
      </h3>
      <div style="float: left;margin-top: -40px;margin-left: 2px">
        <el-tooltip content="增加项目" v-show="showprojectmanager">
          <el-button type="info" size="mini" icon="el-icon-plus" @click=" addProject "
                     plain></el-button>
        </el-tooltip>

      </div>
      <div>
        <el-table
          :data="projects"
          :height="tableheight"
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
            prop="name"
            label="项目名字"
            width="300">
          </el-table-column>
          <el-table-column
            prop="projectType"
            label="项目类型"
            width="150">
          </el-table-column>
          <el-table-column
            prop="djzqdm"
            label="行政区代码"
            width="150">
          </el-table-column>
          <el-table-column
            prop="xzdms.length"
            label="行政区总数量"
          >
          </el-table-column>
          <el-table-column
            prop="notes"
            label="已分配数量"
          >
          </el-table-column>
          <el-table-column
            prop="notes"
            label="未分配数量"
          >
          </el-table-column>
          <el-table-column
            label="操作" width="360"
          >
            <template slot-scope="scope">
              <el-button type="warning" size="mini" @click="deleteProject(scope.$index, scope.row)" plain>删除</el-button>
              <el-button type="info" size="mini" @click="showDiloagEditProject(scope.row)" plain>编辑</el-button>
              <el-button type="info" size="mini" @click="addProjectUser(scope.row)" plain>预选人员</el-button>
              <el-button type="info" size="mini" @click="showDialoagDispatchTask(scope.row)" plain>任务分配</el-button>
            </template>
          </el-table-column>

        </el-table>

        <div id="bottom1" style="text-align: center;">

          <Pageination :searchcustom="searchPo"></Pageination>
        </div>
      </div>
    </div>

    <div v-if="!showprojectmanager" >

  <!--    <el-button type="info"  style="float: left;margin-left: 10px" size="mini" @click="backProjectManager"
                 plain>返回
      </el-button>-->
      <XZQYManager @backProjectManager="backProjectManager" :project="newproject"></XZQYManager>

    </div>

    <div>
      <el-dialog :title="newproject.id ? '编 辑 项 目':'添 加 项 目'" :visible.sync="addProjectDialogVisible" width="450px">
        <el-form>
          <el-form-item label="*项目名字：" :label-width="formLabelWidth">
            <el-input v-model="newproject.name" placeholder="必填"></el-input>
          </el-form-item>
          <el-form-item label="*项目类型：" :label-width="formLabelWidth">
            <el-input v-model="newproject.projectType" placeholder="必填"></el-input>
          </el-form-item>
          <el-form-item label="*区域代码：" :label-width="formLabelWidth">
            <el-input v-model="newproject.djzqdm" placeholder="必填"></el-input>
          </el-form-item>
          <el-form-item label="项目备注：" :label-width="formLabelWidth">
            <el-input v-model="newproject.notes" placeholder="选填"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button type="info" plain @click="addProjectDialogVisible = false">取 消</el-button>
          <el-button type="success" plain @click="saveOrUpdateProject(newproject)" :loading="addloading">{{newproject.id
            ?
            "修 改":"添 加"}}
          </el-button>
        </div>
      </el-dialog>
      <el-dialog title="添  加  项  目  涉  及  人  员" :visible.sync="addProjectUserDialogVisible" width="800px"
                 style="text-align: center">

        <el-transfer style="text-align: left;margin-left: 10%"
                     :titles="['未添加人员','项目人员']"
                     v-model="selectusers"
                     :filterable="true"
                     :props="{
      key: 'id',
      label: 'nickName'
    }"
                     :data="data">
        </el-transfer>

        <div slot="footer" class="dialog-footer">
          <el-button type="info" plain @click="addProjectUserDialogVisible = false">取 消</el-button>
          <el-button type="success" plain @click="updateProjectUser(newproject, selectusers)" :loading="addloading">修改
          </el-button>
        </div>

      </el-dialog>
      <el-dialog title="任  务  分  配" :visible.sync="dispatchTaskDialogVisible" width="800px"
                 style="text-align: center">

        <!-- <el-transfer style="text-align: left;margin-left: 10%"
                      :titles="['未添加人员','项目人员']"
                      v-model="selectusers"
                      :filterable="true"
                      :props="{
         key: 'id',
         label: 'nickName'
       }"
                      :data="data">
         </el-transfer>-->

        <div slot="footer" class="dialog-footer">
          <el-button type="info" plain @click="dispatchTaskDialogVisible = false">取 消</el-button>
          <el-button type="success" plain @click="updateProjectUser(newproject, selectusers)" :loading="addloading">修改
          </el-button>
        </div>

      </el-dialog>
    </div>


  </div>
</template>

<script>
  import Pageination from "../common/Pageination";
  import XZQYManager from "./project/XZQYManager";

  export default {
    name: "ProjectManager",
    components: {XZQYManager, Pageination},
    data() {

      return {
        data: [],
        selectusers: [],//
        users: [],
        showprojectmanager: true,
        projects: [],//表格要显示的user
        user: {},//当前要处理的user,是副本
        formLabelWidth: '100px',
        addProjectDialogVisible: false,
        dispatchTaskDialogVisible: false,//任务分配窗口
        addProjectUserDialogVisible: false,//弹出项目 添加涉及人员窗口
        tableheight: 0,//表格高度
        newproject: {},
        addloading: false,
        currentprojectid: -1,


        searchPo: {
          //搜索对象 栏 使用
          projectname: "",//项目名称
          projectid: "",//项目id
          projectcantractid: "",//合同id
          pageindex: 1,
          limit: 20,
          total: 0,
        },
      }
    },
    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 100;
      this.init();
      /* let data = [];
       for (let i = 1; i <= 15; i++) {
         data.push({
           value: i,
           desc: `备选项 ${i}`,
         });
       }
       this.data = data;*/
    },
    methods: {
      init() {
        this.$store.commit("getCustom", {
          url: "project/findall",
          callback: resultData => {
            if (resultData.status === "Success") {
              this.projects = JSON.parse(resultData.json);
            }
          }
        });
      },
      backProjectManager(newproject) {
        //console.log(11,this.newproject);
        for (let i = 0; i < this.projects.length; i++) {
          let project = this.projects[i];
          if(project.id ==  this.newproject.id){
            this.projects.splice(i, 1, this.newproject);
            break;
          }
        }
        this.showprojectmanager = true;

      },
      /**
       * 弹出方法任务的窗口
       * @param project
       */
      showDialoagDispatchTask(project) {
        this.newproject =JSON.parse(JSON.stringify(project));
        //console.log(998,this.newproject);
        this.showprojectmanager = false;
        //this.dispatchTaskDialogVisible = true;
      },
      /**
       * 找出所有的工作人员，如果users 中有内容，就直接返回 users，不再请求后台
       * @param callback
       */

      findUserAll(callback) {
        if (this.users && this.users.length > 0) {
          callback(this.users);
          return;
        }
        this.$store.commit("getCustom", {
          url: "user/findregistusers", callback: resultData => {
            if (resultData.status === "Success") {
              this.users = JSON.parse(resultData.json);
              callback(this.users);
            } else {
              this.$store.commit("showMessageBox", {type: resultData.status, message: "获取人员失败"});
            }
          }
        });
      },
      /**
       * 找出所有的工作人员，如果users 中有内容，就直接返回 users，不再请求后台
       * @param project
       * @param usersid 选择的user 的 id
       */
      updateProjectUser(project, usersid) {
        console.log(usersid);
        let projectcopy = JSON.parse(JSON.stringify(project));
        this.addloading = true;
        projectcopy.users = [];

        for (let id of usersid) {
          for (let user of  this.users) {
            if (id == user.id) {
              projectcopy.users.push(user);
            }
          }
        }
        if (JSON.stringify(projectcopy) === JSON.stringify(project)) {
          //检查信息是否被改变
          this.$store.commit("notify", {type: "warning", message: "人员没有修改，不用修改"});
          this.addloading = false;
        } else {
          //提交到数据库修改
          this.$store.commit("postCustom", {
            url: "project/updateprojectuser",
            mark: "project",
            po: projectcopy,
            callback: resultData => {
              this.addloading = false;
              if (resultData.status === "Success") {
                project.users = projectcopy.users;
                this.$store.commit("notify", {type: resultData.status, message: "项目人员修改成功"});
                this.addProjectUserDialogVisible = false;
              } else {
                this.$store.commit("showMessageBox", {type: resultData.status, message: "项目人员修改失败"});
              }
            }
          });
        }
      },
      /**
       * 弹出  项目 添加人员窗口
       * @param project
       */
      addProjectUser(project) {

        this.selectusers = [];
        this.findUserAll(users => {
          this.newproject = project;
          this.addProjectUserDialogVisible = true;
          let projectusers = project.users;
          this.data = users;
          if (projectusers) {
            for (let user of projectusers) {
              this.selectusers.push(user.id);
            }
          }
          console.log(this.selectusers)
        });

      },

      toXZQYManager(project) {
        this.$router.push({path: "/admin/xzqymanager?projectid=" + project.id});
      },
      /**
       * 弹出 项目编辑窗口
       * @param project
       */
      showDiloagEditProject(project) {
        this.newproject = JSON.parse(JSON.stringify(project));
        this.addProjectDialogVisible = true;
      },

      addProject() {
        this.newproject = {};
        this.addProjectDialogVisible = true;
      },

      deleteProject(index, project) {
        this.$store.commit("confirm", {
          message: "确定姚删除项目：" + project.name,
          callback: flag => {
            if (flag) {
              this.$store.commit("getCustom", {
                url: "project/deletebyid?id=" + project.id,
                callback: resultData => {
                  if (resultData.status === "Success") {
                    this.projects.splice(index, 1);
                  }
                  this.$store.commit("notify", {type: resultData.status, message: resultData.message});
                }
              });
            }
          }
        });
      },
      /**
       * 添加项目
       * @param project
       */
      saveOrUpdateProject(project) {

        if (!project.name || project.name.trim().length === 0) {
          this.$store.commit("showMessageBox", {type: "error", message: "项目名称不能为空"});
        } else if (!project.projectType || project.projectType.trim().length === 0) {
          this.$store.commit("showMessageBox", {type: "error", message: "项目类型不能为空"});
        } else if (!project.djzqdm || project.djzqdm.trim().length === 0) {
          this.$store.commit("showMessageBox", {type: "error", message: "行政区域代码不能为空"});
        } else {
          //检查是否更改过数据
          for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].id === project.id) {
              if (JSON.stringify(project) == JSON.stringify(this.projects[i])) {
                this.$store.commit("notify", {type: "warning", message: "没有做任何修改"});

                return;
              }
            }
          }
          this.addloading = true;
          this.$store.commit("postCustom", {
            url: "project/addproject",
            po: project,
            mark: "project",
            callback: resultData => {
              if (resultData.status === "Success") {
                if (project.id) {
                  this.$store.commit("notify", {type: "success", message: "编辑成功"});
                  for (let i = 0; i < this.projects.length; i++) {
                    if (this.projects[i].id === project.id) {
                      this.projects.splice(i, 1, project);
                    }
                  }
                } else {
                  this.$store.commit("notify", {type: "success", message: "添加成功"});
                  this.projects.push(JSON.parse(resultData.json));
                }

                this.addProjectDialogVisible = false;
                this.newproject = {};
              } else {
                this.$store.commit("showMessageBox", {type: resultData.status, message: resultData.message});
              }
              this.addloading = false;
            }
          })
        }
      },
    }
  }
</script>

<style scoped>

</style>
