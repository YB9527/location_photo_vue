<template>
  <div>




  </div>
</template>

<script>
  export default {
    name: "DispatchTaskXZDM",
    props: ['project'],
    data() {
      return {
        showzjdtable:false,//以宅基地为单位分配任务
        activeIndex: "",
        defaultactiveIndex: "",
        writezjdsDialogTableVisible: false,
        showAddZJDUserDialog: false,
        zjdtableshow: false,
        writezjds: [],
        zjdtasks: [],
        multipleSelection: [],
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
    watch: {

    },
    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 140;
      //this.$store.commit("arrayOrder",{arr:this.project.xzdms,order:0,method:"DJZQDM"});
      // console.log(111,this.project);
      //this.init();
      //this.xzdms = this.project.xzdms;
    },
    methods: {

      toDispatchTaskXZDM(){
        //this.$router.push({path: '/admin/xzqymanager/dispatchtaskxzdm'});
        //this.$router.push({name: "DispatchTaskXZDM"});
        this.showtable =true;
      },
      toDispatchTaskZJD(){
        this.showtable =false;
      },
      showXZDMTable() {
        this.showtable = true;
        this.zjdtableshow = false;
      },
      /**
       * 保存数据 到 数据库
       * 要求行政代码 djzjdm 进行 从长到短的排序
       * @param writezjds
       */
      saveWriteZJDs(writezjds) {
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
        console.log(writezjds);
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
      findXZDMZJDAll() {
        let xzdmids = [];
        this.showtable = false;
        this.zjdtableshow = false;
        for (let xzdm of this.project.xzdms) {
          xzdmids.push(xzdm.id);
        }
        this.$store.commit("postCustom", {
          url: "zjd/findbyxzdmids",
          mark: "xzdmids",
          po: xzdmids,
          callback: resultData => {
            let zjds = JSON.parse(resultData.json);
            console.log(zjds);
            for (let xzdm of this.project.xzdms) {
              xzdm.zjds = [];
              for (let zjd of zjds) {
                if (xzdm.id == zjd.xzdmid) {
                  xzdm.zjds.push(zjd);
                }
              }
            }
            //this.showtable =true;
            this.zjdtableshow = true;
          }
        })
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
        this.$emit('backProjectManager', this.project);
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

      }
      ,
      test() {
        alert(this.activeIndex)
      }
      ,
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
        //console.log(4,this.project.id);

        this.$store.commit("getCustom", {
          url: "/xzdm/findbyprojectid?projectid=" + this.project.id, callback: resultdata => {

            if (resultdata.status === "Success") {
              this.project.xzdms = JSON.parse(resultdata.json);
              this.showtable = true;
              // console.log(5, this.project);
              //行政代码排序
              this.$store.commit("arrayOrder", {arr: this.project.xzdms, order: 0, method: "DJZQDM"});
              this.dialogTableVisible = false;
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
