<template>
  <div>
    <h3>
      项目管理
    </h3>
    <div style="float: left;margin-top: -40px;margin-left: 2px">
      <el-tooltip content="增加项目">
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
          width="300">
        </el-table-column>
        <el-table-column
          prop="notes"
          label="项目备注"
        >
        </el-table-column>
        <el-table-column
          label="操作"
        >
          <template slot-scope="scope">
            <el-button type="info" @click="showDiloagEditProject(scope.row)" plain>编辑</el-button>
            <el-button type="info" @click="deleteProject(scope.$index, scope.row)" plain>删除</el-button>
          </template>
        </el-table-column>

      </el-table>
      <div id="bottom1" style="text-align: center;">
        <Pageination :searchcustom="searchPo"></Pageination>
      </div>
    </div>
    <el-dialog :title="newproject.id ? '编 辑 项 目':'添 加 项 目'" :visible.sync="addProjectDialogVisible" width="450px">
      <el-form :model="user">
        <el-form-item label="*项目名字：" :label-width="formLabelWidth">
          <el-input v-model="newproject.name" placeholder="必填"></el-input>
        </el-form-item>
        <el-form-item label="*项目类型：" :label-width="formLabelWidth">
          <el-input v-model="newproject.projectType" placeholder="必填"></el-input>
        </el-form-item>
        <el-form-item label="项目备注：" :label-width="formLabelWidth">
          <el-input v-model="newproject.notes" placeholder="选填"></el-input>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="info" plain @click="addProjectDialogVisible = false">取 消</el-button>
        <el-button type="success" plain @click="saveOrUpdateProject(newproject)" :loading="addloading">{{newproject.id ?
          "修 改":"添 加"}}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import Pageination from "../common/Pageination";

  export default {
    name: "ProjectManager",
    components: {Pageination},
    data() {
      return {
        projects: [],//表格要显示的user
        user: {},//当前要处理的user,是副本
        formLabelWidth: '100px',
        addProjectDialogVisible: false,
        tableheight: 0,//表格高度
        newproject: {},
        addloading: false,
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
                url: "project/deletebyid?id="+project.id,
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
        this.addloading = true;
        if (!project.name || project.name.trim().length === 0) {
          this.$store.commit("showMessageBox", {type: "error", message: "项目名称不能为空"});
        } else if (!project.projectType || project.projectType.trim().length === 0) {
          this.$store.commit("showMessageBox", {type: "error", message: "项目类型不能为空"});
        } else {
          //检查是否更改过数据
          for (let i = 0; i < this.projects.length; i++) {
            if (this.projects[i].id === project.id) {
              if(JSON.stringify(project) == JSON.stringify(this.projects[i])){
                this.$store.commit("notify", {type: "warning", message: "没有做任何修改"});
                this.addloading = false;
                return;
              }
            }
          }

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
