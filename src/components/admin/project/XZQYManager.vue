<template>
  <div>
    <h2>行政区域任务分配</h2>

    <div style="float: left;margin-bottom: 3px">选择行政代码表格： <input id="upload_file" type="file" @change="submitUpload"
                                          v-if="fileshow"/>
      <el-button @click="deleteXZDMs(xzdms)" plain>清空没有关联数据</el-button>
    </div>
    <div style="clear: both"></div>
    <el-table :data="xzdms" :height="tableheight" border style="text-align: center">
      <el-table-column type="index" label="序号" width="60px">
        <template slot-scope="scope">
          {{scope.$index +1}}
        </template>
      </el-table-column>
      <el-table-column property="DJZQDM" label="地籍子区代码" width="300px"></el-table-column>
      <el-table-column property="DJZQMC" label="地籍子区名称" width="400px"></el-table-column>
      <el-table-column property="DJZQMC" label="地块数量" ></el-table-column>
      <el-table-column property="DJZQMC" label="地块数量" ></el-table-column>
      <el-table-column property="DJZQMC" label="已完成数量" ></el-table-column>
      <el-table-column property="DJZQMC" label="未完成数量" ></el-table-column>
      <el-table-column property="DJZQMC" label="任务发放时间" ></el-table-column>
      <el-table-column property="DJZQMC" label="任务完成时间" ></el-table-column>
      <el-table-column property="DJZQMC" label="执行者" ></el-table-column>
      <el-table-column property="DJZQMC" label="执行者工作区域数量" ></el-table-column>
    </el-table>
    <div style="float: left"><span>总行政区域：50</span>&nbsp;&nbsp;&nbsp;&nbsp;<span> 已分配/未分配 : 20/30</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>已完成/未完成：5/45</span></div>
    <el-dialog title="行政区域数据预览" :visible.sync="dialogTableVisible" width="850px">
      <el-table :data="writexzdms" height="300" border>
        <el-table-column type="index" label="序号" width="60px">
          <template slot-scope="scope">
            {{scope.$index +1}}
          </template>
        </el-table-column>
        <el-table-column property="DJZQDM" label="地籍子区代码" width="300px"></el-table-column>
        <el-table-column property="DJZQMC" label="地籍子区名称" width="400px"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogTableVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveWriteXZDMs(writexzdms)" v-show="importshow">导 入</el-button>
     </span>
    </el-dialog>
  </div>


</template>

<script>
  import XLSX from 'xlsx';
  import Pageination from "../../common/Pageination";

  export default {
    name: "XZQYManager",
    components: {Pageination},
    data() {
      return {
        xzdms: [],//数据库中的行政代码
        writexzdms: [],//excel中的行政代码
        fileshow: true,
        dialogTableVisible: false,
        importshow: false,
        tableheight: 0,
        searchproject: {
          //搜索对象 栏 使用
          projectname: "",//项目名称
          projectid: "",//项目id
          projectcantractid: "",//合同id
          pageindex: 1,
          limit: 20,
          total: 0,
        },
      };
    },
    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 140;
      this.init();
    },
    methods: {
      /**
       * 初始化页面
       *
       */
      init() {
        this.$store.commit("getCustom", {
          url: "/xzdm/findall", callback: resultdata => {
            this.xzdms = JSON.parse(resultdata.json);
            if (resultdata.status === "Success") {
              this.dialogTableVisible = false;
            } else {
              this.$store.commit("showMessageBox", {
                type: resultdata.status.toLowerCase(),
                message: resultdata.message
              });
            }
          }
        });
      },

      submitUpload(e) {
        let self = this;
        this.fileshow = false;
        let files = e.target.files;
        if (files.length > 0) {
          this.readExcel(files, function (array) {
            if (array.length > 0) {
              self.$store.commit("postCustom", {
                url: "/xzdm/checkxzdms", mark: "xzdms", po: array, callback: resultdata => {
                  if (resultdata.status === "Success") {
                    self.writexzdms = array;
                    self.dialogTableVisible = true;
                    self.importshow = true;
                  } else {
                    self.$store.commit("showMessageBox", {
                      type: resultdata.status.toLowerCase(),
                      message: resultdata.message
                    });
                  }
                  self.fileshow = true;
                }
              });
            }
          });
        }
      },
      /**
       * 只能删除没有关联的行政代码
       * @param xzdms
       */
      deleteXZDMs(xzdms) {
        this.$store.commit("confirm", {
          message: "是否删除没有关联的行政代码？",
          callback: falg => {
            if (falg) {
              this.$store.commit("postCustom", {
                url: "/xzdm/deletexzdms", mark: "xzdms", po: xzdms, callback: resultdata => {
                  if (resultdata.status === "Success") {
                    this.init();
                    this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: "删除成功"});
                  } else {
                    this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message});
                  }
                }
              });
            }
          }
        });
      },
      /**
       * 保存 行政区域 进数据库
       * @param writexzdms
       */
      saveWriteXZDMs(writexzdms) {
        this.$store.commit("postCustom", {
          url: "/xzdm/savexzdms", mark: "xzdms", po: writexzdms, callback: resultdata => {
            if (resultdata.status === "Success") {

              this.dialogTableVisible = true;
              this.importshow = true;
              this.init();
            } else {
              self.$store.commit("showMessageBox", {
                type: resultdata.status.toLowerCase(),
                message: resultdata.message
              });
            }
            this.dialogTableVisible = false;
            this.fileshow = true;
          }
        });

      },
      /**
       * 读取excel
       * @param files
       * @param callback
       * @returns {boolean}
       */
      readExcel(files, callback) {//表格导入
        if (files.length <= 0) {//如果没有文件名
          return false;
        }
        const fileReader = new FileReader();
        fileReader.onload = (ev) => {
          //console.log(1);
          const data = ev.target.result;
          const workbook = XLSX.read(data, {
            type: 'binary'
          });
          const wsname = workbook.SheetNames[0];//取第一张表
          const ws = XLSX.utils.sheet_to_json(workbook.Sheets[wsname]);//生成json表格内容
          this.outputs = [];//清空接收数据
          //删掉第二行的提示栏
          this.items = ws.splice(1);
          callback(this.items);
        };
        fileReader.readAsBinaryString(files[0]);
      },
    }
  }
</script>

<style scoped>

</style>
