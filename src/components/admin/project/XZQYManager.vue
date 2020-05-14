<template>
  <div>

    <h3 style="margin: 0px">“{{project.name}}” 项目 {{title}} </h3>
    <el-menu
      :default-active="defaultactiveIndex"
      class="el-menu-demo"
      mode="horizontal"
      @select="handleSelect"
      background-color="#909399"
      text-color="#fff"
      active-text-color="#ffd04b">
      <el-menu-item index="1" @click="backProjectManager">返回</el-menu-item>
      <el-submenu index="2">
        <template slot="title">数据导入</template>
        <el-menu-item index="2-1" @click="uploadxzdm"><input ref="upload" v-show="false" type="file"
                                                             @change="submitUpload"
                                                             v-if="fileshow"/> 1、行政区域Excel导入
        </el-menu-item>
        <el-menu-item index="2-2" @click="uploadzjd">2、地块shp导入 <input ref="uploadzjd" v-show="false" type="file"
                                                                      multiple
                                                                      @change="zjdsSubmitUpload" v-if="fileshow"/>
        </el-menu-item>
      </el-submenu>
      <el-submenu index="3" :disabled="project.xzdms && project.xzdms.length >0?false:true">
        <template slot="title">任务分配</template>
        <el-menu-item index="3-1" @click="toDispatchTaskXZDM"> 1、区域分配任务</el-menu-item>
        <el-menu-item index="3-2" @click="toDispatchTaskZJD">2、单个地块任务</el-menu-item>
      </el-submenu>

      <el-menu-item index="4" @click="toMediaManagerRouter"
      >多媒体数据定义
      </el-menu-item>
      <el-menu-item index="5" :disabled="multipleSelection.length === 0 " style="float: right"
                    v-show="showtable && showproject"
                    @click="openAddXZDMUserDialog">分配工作人员
      </el-menu-item>
      <el-menu-item index="6" style="float: right"
                    v-show="!showxzdmtable && !showxzdmtable && showproject"
                    @click="openAddZJDUserDialog">地块分配工作人员
      </el-menu-item>

      <el-menu-item index="7" @click="deleteXZDMs(project.xzdms)">清空没有关联区域</el-menu-item>
    </el-menu>
    <div v-show="showproject">
      <el-table v-if="showxzdmtable" :data="currentproject.xzdms" :height="tableheight" border
                style="text-align: center"
                @selection-change="handleSelectionChange">
        <el-table-column v-show="false" type="index" label="序号" width="60px">
          <template slot-scope="scope">
            {{scope.$index +1}}
          </template>
        </el-table-column>
        <el-table-column property="DJZQDM" label="地籍子区代码" width="200px">
        </el-table-column>
        <el-table-column property="DJZQMC" label="地籍子区名称" width="300px"></el-table-column>
        <el-table-column label="地块数量" width="100px">
          <template slot-scope="scope">
            <span>{{scope.row.zjds ? (scope.row.zjds.length === 0?"":scope.row.zjds.length) :""}}</span>
          </template>
        </el-table-column>
        <el-table-column property="DJZQMC" label="已完成数量"></el-table-column>
        <el-table-column property="DJZQMC" label="未完成数量"></el-table-column>

        <el-table-column
          type="selection"
          v-if="showtable"
          width="55">
        </el-table-column>
        <el-table-column
          label="操作" width="200"
        >
          <template slot-scope="scope">
            <el-button v-show="showzjdtaskbtu &&scope.row.zjds && scope.row.zjds.length >0 " type="warning" size="mini"
                       @click="showZJDTable(scope.$index,scope.row)" plain
            >以地块分配
            </el-button>
          </template>

        </el-table-column>
      </el-table>

      <div style="clear: both"></div>
      <div v-if="!showxzdmtable">
        <DispatchTaskZJD ref="dispatchTaskZJD" :currentxzdm="currentxzdm" :users="project.users"></DispatchTaskZJD>
      </div>
      <!--按照行政区分配任务-->
      <div style="float: left">
        <span>总行政区域：{{project.xzdms ? project.xzdms.length:0}}</span>&nbsp;&nbsp;&nbsp;&nbsp;<span> 已分配/未分配 : 20/30</span>&nbsp;&nbsp;&nbsp;&nbsp;<span>已完成/未完成：5/45</span>
      </div>
    </div>
    <div v-if="!showproject">
      <MediaManager :currentproject="project"></MediaManager>
    </div>
    <!--分页脚本-->
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
    <el-button type="primary" @click="saveWriteXZDMs(writexzdms)" :loading="importxzdmsloading"
               v-show="importshow">导 入</el-button>
     </span>
    </el-dialog>
    <el-dialog title="行政区域分配工作人员" :visible.sync="showAddXZDMUserDialog" width="950px">
      <div style="float: left;">
        <el-table :data="multipleSelection" height="350" border style="float: left;">
          <el-table-column type="index" label="序号" width="60px">
            <template slot-scope="scope">
              {{scope.$index +1}}
            </template>
          </el-table-column>
          <el-table-column property="DJZQDM" label="地籍子区代码" width="150px"></el-table-column>
          <el-table-column property="DJZQMC" label="地籍子区名称" width="200px"></el-table-column>
          <!--<el-table-column  label="地块数量" width="80px">
            <template slot-scope="scope">
              {{scope.row.zjds.length}}
            </template>
          </el-table-column>-->
        </el-table>
      </div>
      <div style="float: left;margin-left: 20px;">
        <el-table :data="project.users" height="350" border style="float: left;">
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
    <el-dialog title="shp数据预览" :visible.sync="writezjdsDialogTableVisible">
      <el-table :data="writezjds" height="300" border>
        <el-table-column type="index" label="序号" width="60px">
          <template slot-scope="scope">
            {{scope.$index +1}}
          </template>
        </el-table-column>
        <el-table-column property="ZDNUM" label="宗地编号" width="350"></el-table-column>
        <el-table-column property="QUANLI" label="权利" width="100"></el-table-column>
        <el-table-column property="BZ" label="备注"></el-table-column>
      </el-table>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogTableVisible = false">取 消</el-button>
    <el-button type="primary" @click="saveWriteZJDs(writezjds)" :loading="saveWriteZJDsLoading"
               v-show="importshow">导 入</el-button>
     </span>
    </el-dialog>

  </div>


</template>

<script>
  import XLSX from 'xlsx';
  import DispatchTaskZJD from "./DispatchTaskZJD";
  import Pageination from "../../common/Pageination";
  import MediaManager from './MediaManager';

  export default {
    name: "XZQYManager",
    props: ['currentproject'],
    components: {Pageination, DispatchTaskZJD, MediaManager},
    data() {
      return {
        project: {},//当前操作的项目
        title: "",
        showxzdmtable: true,//行政代码窗口显示
        showproject: true,//如果是projectmanager 路由，那么是true 显示
        showtable: false,
        showzjdtaskbtu: false,
        currentxzdm: {},//以地块为分配的
        activeIndex: "",
        defaultactiveIndex: "",
        writezjdsDialogTableVisible: false,
        showAddZJDUserDialog: false,
        zjdtableshow: false,
        writezjds: [],
        zjdtasks: [],
        multipleSelection: [],
        zjdmultipleSelection: [],
        isopendispatchtask: true,//是否打开分配任务
        //xzdms: [],//数据库中的行政代码
        writexzdms: [],//excel中的行政代码
        fileshow: true,
        dialogTableVisible: false,
        saveWriteZJDsLoading: false,
        importshow: false,
        importxzdmsloading: false,//导入行政代码到库中的等待
        showAddXZDMUserDialog: false,//弹出行政区域添加人员窗口
        tableheight: 0,
      };
    },
    watch: {
      $route(to, from) {

      },
      activeIndex(to, from) {


        if (to === "4") {
          this.showproject = false;
          this.title = "多媒体";
        } else {
          this.showproject = true;
          this.title = "任务区域分配";
        }
      }

    },

    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 140;
      this.showtable = true;
      this.project = this.currentproject;
      //this.$store.commit("arrayOrder",{arr:this.project.xzdms,order:0,method:"DJZQDM"});
      // console.log(111,this.project);
      this.project.xzdms = [];
      this.init();

      //this.toDispatchTaskXZDM();

      //this.xzdms = this.project.xzdms;
    },
    methods: {
      toMediaManagerRouter() {

      },
      openAddZJDUserDialog() {
        this.$refs.dispatchTaskZJD.openAddZJDUserDialog("嘿嘿嘿");
      },
      showZJDTable(index, xzdm) {
        this.currentxzdm = xzdm;
        this.showxzdmtable = false;
      },
      toDispatchTaskXZDM() {
        //this.$router.push({path: '/admin/xzqymanager/dispatchtaskxzdm'});
        //this.$router.push({name: "DispatchTaskXZDM"});
        this.showtable = true;
        this.showxzdmtable = true;
        this.showzjdtaskbtu = false;
      },
      toDispatchTaskZJD() {
        this.showtable = false;
        this.showxzdmtable = true;
        this.showzjdtaskbtu = true;
      },

      /**
       * 保存数据 到 数据库
       * 要求行政代码 djzjdm 进行 从长到短的排序
       * @param writezjds
       */
      saveWriteZJDs(writezjds) {
        for (let tem of writezjds) {
          tem.isUpload = true;
        }
        let updateXZDMs = [];//发生改表了的行政区域
        //this.saveWriteZJDsLoading = true;
        let xzdms = JSON.parse(JSON.stringify(this.project.xzdms));
        this.$store.commit("arrayOrder", {arr: xzdms, order: 1, method: "DJZQDM"});
        let formData = new FormData();
        for (let zjd of this.writezjds) {

          let zdnum = zjd.ZDNUM;
          let zjddjzqdm = zdnum.replace("JA", "").replace("JB", "").replace("JC", "");
          zjd.xzdm = null;
          for (let xzdm of xzdms) {
            let djzqdm = xzdm.DJZQDM;
            if (zjddjzqdm.indexOf(djzqdm) > -1) {
              if (zjd.xzdm != null) {
                //只会发生在上级区域,移除次宅基地
                for (let i = 0; i < xzdm.zjds.length; i++) {
                  let zjdinxzdm = xzdm.zjds[i];
                  if (zjdinxzdm.ZDNUM == zdnum) {
                    xzdm.zjds.splice(i, 1);
                  }
                }
              } else {
                //只有最底层的行政区域
                //xzdm.zjds.push(zjd);
                zjd.xzdm = xzdm;
                //添加被修改的行政代码
                for (let updatexzdm of updateXZDMs) {

                }
                let findIndex = updateXZDMs.findIndex(updatexzdm => xzdm.DJZQDM === xzdm.DJZQDM);
                if (findIndex === -1) {
                  updateXZDMs.push(xzdm);
                }

                break;
              }

            }

          }
        }
        //避免 转json 死循环 zjd中的xzdm 取消
        //检查是否每一个宅基地都有行政区
        for (let zjdtem of writezjds) {
          if (!zjdtem.xzdm) {
            this.$store.commit("showMessageBox", {
              type: "error",
              message: "第：" + (writezjds.indexOf(zjdtem) + 1) + " 个宅基地，没有行政区，请检查宅基地"
            });
            this.saveWriteZJDsLoading = false;
            return;
          }
        }

        this.$store.commit("postCustom", {
          url: "zjd/savezjds?projectid=" + this.project.id,
          mark: "zjds",
          po: writezjds,
          callback: resultData => {
            this.saveWriteZJDsLoading = false;
            if (resultData.status === "Success") {
              this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "导入成功"});
              this.init();
              this.writezjdsDialogTableVisible = false;
            } else {
              this.$store.commit("showMessageBox", {
                type: resultData.status.toLowerCase(),
                message: resultData.message
              });
            }
          }
        });
      },

      uploadxzdm() {
        this.$refs.upload.click();
      }
      ,
      uploadzjd() {
        this.$refs.uploadzjd.click();
      }
      ,
      backProjectManager() {

        if (this.showxzdmtable) {
          this.$emit('backProjectManager', this.project);
        } else {
          this.showxzdmtable = true;
        }

      }
      ,
      zjdsSubmitUpload(e) {

        this.fileshow = false;
        let files = e.target.files;
        let formData = new FormData();
        // formData重复的往一个值添加数据并不会被覆盖掉，可以全部接收到，可以通过formData.getAll('files')来查看所有插入的数据
        for (let i = 0; i < files.length; i++) {
          // formData.append(files[0].name.substring(0,files[0].name.indexOf("\.")), files[i])
          formData.append(files[i].name, files[i])
        }

        this.$store.commit("postFiles", {
          url: this.$store.getters.getMapHost + "uploads", formData: formData, callback: (resultdata) => {
            if (resultdata.status === "Success") {
              this.writezjds = JSON.parse(resultdata.json);

              if (this.writezjds && this.writezjds.length > 0) {
                this.writezjdsDialogTableVisible = true;
                this.importshow = true;

              }
            } else {
              this.importshow = false;
              this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message})
            }
            this.fileshow = true;
          }
        });

      }
      ,
      handleSelect(key, keyPath) {
        this.activeIndex = key;
      },

      findXZDMZJDAll(xzdms, callback) {
        let xzdmids = [];
        this.showtable = false;
        this.zjdtableshow = false;
        for (let xzdm of xzdms) {
          xzdmids.push(xzdm.id);
        }
        this.$store.commit("postCustom", {
          url: "zjd/findbyxzdmids",
          mark: "xzdmids",
          po: xzdmids,
          callback: resultData => {
            let zjds = JSON.parse(resultData.json);
            for (let xzdm of xzdms) {
              xzdm.zjds = [];
              for (let zjd of zjds) {
                if (xzdm.id == zjd.xzdmid) {
                  xzdm.zjds.push(zjd);
                }
              }
            }
            callback(xzdms);
            //this.showtable =true;
            this.zjdtableshow = true;
          }
        })
      },

      dispathTak(index, xzdm) {
        console.log(xzdm);
      }
      ,


      /**
       * 初始化页面
       *
       */
      init() {
        // let self = this;
        //console.log(4,this.project);

        this.$store.commit("getCustom", {
          url: "/xzdm/findbyprojectid?projectid=" + this.project.id, callback: resultdata => {

            if (resultdata.status === "Success") {

              if(this.project.xzdms){
                this.project.xzdms.splice(0,this.project.xzdms.length);
              }
              let xzdmsTemp = JSON.parse(resultdata.json);

              for(let xzdmTemp of xzdmsTemp){
                this.project.xzdms.push(xzdmTemp);
              }
              //this.showtable = true;
              //行政代码排序
              this.$store.commit("arrayOrder", {arr: this.project.xzdms, order: 0, method: "DJZQDM"});
              //查找所有的宅基地
              this.findXZDMZJDAll(this.project.xzdms, xzdms => {
                this.dialogTableVisible = false;
              });

            } else {
              this.$store.commit("showMessageBox", {
                type: resultdata.status.toLowerCase(),
                message: resultdata.message
              });
            }
          }
        });
      }
      ,
      selectUser(xzdms, user) {
        this.$store.commit("confirm", {
          message: "确定要分配给：'" + user.nickName + "' 吗？", callback: flag => {
            if (flag) {
              let xzdmids = [];
              for (let xzdm of xzdms) {
                xzdmids.push(xzdm.id);

              }
              let myFormDatas = new FormData();

              myFormDatas.append("xzdms", JSON.stringify(xzdms));
              myFormDatas.append("userid", user.id);

              //提交到后台保存
              this.$store.commit("postFormDataCustom", {
                url: "xzdm/savesetuser",
                formdata: myFormDatas,
                callback: resultData => {
                  if (resultData.status === "Success") {
                    this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "任务分配成功"});
                    this.showAddXZDMUserDialog = false;
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
      ,
      handleSelectionChange(val) {
        this.multipleSelection = val;
      },
      zjdhandleSelectionChange(val) {
        this.zjdmultipleSelection = val;
      },
      //得到行政代码中 所有的宅基地
      getXZDMZJDAll(xzdms) {
        let zjds = [];
        for (let xzdm of this.multipleSelection) {
          if (xzdm.zjds) {
            for (let zjd of xzdm.zjds) {
              zjds.push(zjd);
            }
          }
        }
        return zjds;
      },
      //打开 添加人员的窗口
      openAddXZDMUserDialog() {
        //得到选择的人员
        //弹出窗口

        /* let zjds = this.getXZDMZJDAll(this.multipleSelection);
         if(!zjds ||zjds.length === 0){
           this.$store.commit("showMessageBox", {
             type: "error",
             message: "没有选择到任何的宅基地"
           });
         }else{

         }*/

        this.showAddXZDMUserDialog = true;
      }
      ,
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
                    self.$store.commit("arrayOrder", {arr: self.writexzdms, order: 0, method: "DJZQDM"});
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
      }
      ,
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
      }
      ,
      /**
       * 保存 行政区域 进数据库
       * @param writexzdms
       */
      saveWriteXZDMs(writexzdms) {

        this.importxzdmsloading = true;
        let self = this;
        this.$store.commit("postCustom", {
          url: "/project/importxzdms?projectid=" + self.project.id,
          mark: "xzdms",
          po: writexzdms,
          callback: resultdata => {
            this.importxzdmsloading = false;
            if (resultdata.status === "Success") {
              self.$store.commit("notify", {type: resultdata.status, message: "导入成功"});
              self.dialogTableVisible = true;
              self.importshow = true;
              self.init();
            } else {
              self.$store.commit("showMessageBox", {
                type: resultdata.status.toLowerCase(),
                message: resultdata.message
              });
            }
            self.dialogTableVisible = false;
            self.fileshow = true;

          }
        });

      }
      ,
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
          //this.items = ws.splice(1);
          this.items = ws;
          callback(this.items);
        };
        fileReader.readAsBinaryString(files[0]);
      }
      ,
    }
  }
</script>

<style scoped>

</style>
