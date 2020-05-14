<template>
  <!--按照人员来分配任务-->
  <div>
    <el-table :data="xzdm.zjds" :height="tableheight" border style="text-align: center"
              @selection-change="zjdhandleSelectionChange">
      <el-table-column type="index" label="序号" width="60px">
        <template slot-scope="scope">
          {{scope.$index +1}}
        </template>
      </el-table-column>
      <el-table-column property="ZDNUM" label="宗地编码" width="200px">
      </el-table-column>
      <el-table-column property="QUANLI" label="权利人" width="100px"></el-table-column>
      <el-table-column property="task.createdate" label="任务发放时间"></el-table-column>
      <el-table-column property="task.status" label="任务状态">
        <template slot-scope="scope">
          {{scope.row.task | taskStatusFormat }}
        </template>
      </el-table-column>
      <el-table-column  label="任务完成时间">
        <template slot-scope="scope">
          {{scope.row.task | taskFinishDateFormat }}
        </template>

      </el-table-column>
      <el-table-column label="当前工作者">
        <template slot-scope="scope">
      <!--    {{scope.row.task?scope.row.task.user.nikeName:""}}-->
          {{scope.row.task?scope.row.task.user.nickName:""}}
        </template>
      </el-table-column>
      <el-table-column
        type="selection"
        width="55">
      </el-table-column>
    </el-table>
    <el-dialog title="宅基地分配工作人员" :visible.sync="showAddZJDUserDialog" width="950px">
      <div style="float: left;">
        <el-table :data="multipleSelection" height="350" border style="float: left;">
          <el-table-column type="index" label="序号" width="60px">
            <template slot-scope="scope">
              {{scope.$index +1}}
            </template>
          </el-table-column>
          <el-table-column property="ZDNUM" label="宗地编号" width="200px"></el-table-column>
          <el-table-column property="QUANLI" label="权利人" width="100px"></el-table-column>
          <el-table-column property="BZ" label="备注" width="100px"></el-table-column>
          <!--<el-table-column  label="地块数量" width="80px">
            <template slot-scope="scope">
              {{scope.row.zjds.length}}
            </template>
          </el-table-column>-->
        </el-table>
      </div>
      <div style="float: left;margin-left: 20px;">
        <el-table :data="users" height="350" border style="float: left;">
          <el-table-column type="index" label="序号" width="60px">
            <template slot-scope="scope">
              {{scope.$index +1}}
            </template>
          </el-table-column>
          <el-table-column property="nickName" label="姓名" width="150px"></el-table-column>
          <el-table-column property="bz" label="备注" width="100px"></el-table-column>
          <el-table-column
            label="操作"
          >
            <template slot-scope="scope">
              <el-button type="warning" size="mini" @click="selectUser(multipleSelection, scope.row)" plain>选择
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div style="clear: both">
      </div>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "DispatchTaskZJD",
    props: ['currentxzdm','users'],
    data() {
      return {
        xzdm:{},
        tableheight: 0,
        multipleSelection: [],
        showAddZJDUserDialog: false,//弹出行政区域添加人员窗口
      }
    },
    filters: {
      taskFinishDateFormat(task){
        console.log(task);
      },
      taskStatusFormat(task) {
        if(!task){
          return "未开始";
        }
        switch (task.status) {
          case 0:
            return "完成";
          case  1:
            return "进行中";
          case 2:
            return "异常";
          default:
            break;
        }
      }
    },
    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 140;
      this.xzdm =JSON.parse(JSON.stringify(this.currentxzdm))  ;
      this.init(this.xzdm);
    },
    methods: {
      init(xzdm){
        this.xzdm.zjds = [];
        this.$store.commit("getCustom",{
          url:"zjd/findbyxzdmid?xzdmid="+xzdm.id,
          callback:resultData=>{
            this.xzdm.zjds = JSON.parse(resultData.json);
          }
        });
      },
      openAddZJDUserDialog(){
         this.showAddZJDUserDialog= true;
      },
      dispathzjdTak(index, xzdm) {

      },
      zjdhandleSelectionChange(val) {
        this.multipleSelection = val;
      },
      selectUser(zjds, user) {
        this.$store.commit("confirm", {
          message: "确定要分配给：'" + user.nickName + "' 吗？", callback: flag => {
            if (flag) {
              let myFormDatas = new FormData();
              myFormDatas.append("zjds", JSON.stringify(zjds));
              myFormDatas.append("userid", user.id);
              //提交到后台保存
              this.$store.commit("postFormDataCustom", {
                url: "zjd/savesetuser",
                formdata: myFormDatas,
                callback: resultData => {
                  if (resultData.status === "Success") {
                    this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "任务分配成功"});
                    this.showAddZJDUserDialog = false;
                    //跟新本组的宅基地
                    this.init(this.xzdm);
                  } else {
                    this.$store.commit("showMessageBox", {
                      type: resultData.status.toLowerCase(),
                      message: resultData.message
                    });
                  }
                }
              });

            }
          }
        });
      }

    },
  }
</script>

<style scoped>

</style>
