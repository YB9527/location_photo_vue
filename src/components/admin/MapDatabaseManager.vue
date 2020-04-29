<template>
  <div>
    <h2>地图数据管理</h2>
    <span style="float: left">选择shp(7个文件)更新数据： <input id="upload_file" type="file" multiple
                                                      @change="submitUpload" v-if="fileshow"/> </span>


    <el-table :data="zjds" :height="tableheight" border>
      <el-table-column type="expand">
        <template slot-scope="props">
          <div class="demo-image__lazy" style="float: left;margin-left: 20px" v-for="photo in  props.row.photos"
               :key="photo.id">
            <!--  <h3 style="margin-left: 20%;" ></h3>-->
            <div>
              <el-dropdown trigger="click" style="clear: both">
      <span class="el-dropdown-link">
        {{photo.name}} <i class="el-icon-arrow-down el-icon--right"></i>
      </span>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item icon="el-icon-edit" @click.native="showEditphoto(props.row,photo)">编辑
                  </el-dropdown-item>
                  <el-dropdown-item icon="el-icon-delete" @click.native="showDeletephoto(props.row,photo)">删除
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </div>

            <el-image style="width:200px;height:300px;" fit="contain"
                      :src="$store.getters.getHost+'zjdphoto/lookphoto?path='+photo.path" lazy></el-image>
          </div>
        </template>
      </el-table-column>
      <el-table-column type="index" label="序号" width="60px">
        <template slot-scope="scope">
          {{scope.$index +1}}
        </template>
      </el-table-column>
      <el-table-column property="ZDNUM" label="宗地编号" width="350"></el-table-column>
      <el-table-column property="QUANLI" label="权利" width="100"></el-table-column>
      <el-table-column property="BZ" label="备注"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <div id="bottom1" style="text-align: center;">
      <Pageination :searchcustom="searchproject"></Pageination>
    </div>
    <!-- Table -->
    <el-dialog title="shp数据预览" :visible.sync="dialogTableVisible">
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
    <el-button type="primary" @click="saveWriteZJDs(writezjds)" v-show="importshow">导 入</el-button>
     </span>
    </el-dialog>
    <el-dialog title="照片编辑" :visible.sync="dialogEditPhototVisible" width="400px">
      <el-form>
        <el-form-item label="照片名称：" :label-width="formLabelWidth">
          <el-input v-model="editPhoto.name"></el-input>
        </el-form-item>
        <el-form-item label="备注：" :label-width="formLabelWidth">
          <el-input v-model="editPhoto.bz"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
    <el-button @click="dialogEditPhototVisible = false">取 消</el-button>
    <el-button type="primary" @click="okEditPhoto(editPhoto)">确 定</el-button>
     </span>
    </el-dialog>
  </div>
</template>

<script>
  import axios from 'axios'
  import Pageination from "../common/Pageination";

  export default {
    name: "MapDatabaseManager",
    components: {Pageination},
    data() {
      return {
        action: this.$store.getters.getMapHost + "uploads",
        imageurls: ["http://127.0.0.1:3334/zjdphoto/pic"],
        zjds: [],
        fileshow: true,
        importshow: false,//如果导入的数据有问题，那么就不能让其导入，隐藏按钮
        writezjds: [],
        editPhoto: {},//当前被编辑的照片
        editzjd: {},
        dialogTableVisible: false,
        dialogEditPhototVisible: false,
        formLabelWidth: '100px',//编辑照片中的控件大小
        tableheight: 0,
        fileList: [],
        param: '', // 表单要提交的参数
        searchproject: {
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
      this.tableheight = this.$store.getters.getWindowHeight - 130;
      this.init();

    },
    methods: {
      /**
       * 初始化页面
       *
       */
      init() {
        this.$store.commit("getCustom", {
          url: "/zjd/findalltoresultdata", callback: resultdata => {
            this.zjds = JSON.parse(resultdata.json);

            if (resultdata.status === "Success") {
              this.dialogTableVisible = false;
            } else {
              this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message});
            }
          }
        });
      },
      handleDelete(index, zjd) {

        this.$store.commit("confirm", {
          message: "是否删除宗地：" + zjd.ZDNUM,
          callback: falg => {
            if (falg) {
              this.$store.commit("getCustom", {
                url: "zjd/deletezjdbyid?idstr=" + zjd.id,
                callback: (resultdata) => {
                  if (resultdata.status === "Success") {
                    this.zjds.splice(index, 1);
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
       * 弹出编辑照片窗口
       *@param zjd
       * @param photo
       */
      showEditphoto(zjd, photo) {
        //复制对象
        this.editzjd = JSON.parse(JSON.stringify(zjd));
        this.editPhoto = JSON.parse(JSON.stringify(photo));
        this.dialogEditPhototVisible = true;
      },
      /**
       * 保存编辑的照片
       *@param editPhoto
       *
       */
      okEditPhoto(editPhoto) {

        let fielname = editPhoto.name;
        if (fielname && fielname.length > 0) {
          for (let i = 0; i < this.editzjd.photos.length; i++) {
            let p = this.editzjd.photos[i];
            if (p.id === editPhoto.id) {
              this.$store.commit("confirm", {
                message: "确定要提交数据吗？",
                callback: falg => {
                  if (falg) {
                    let myFormDatas = new FormData();
                    myFormDatas.append("photo", JSON.stringify(editPhoto));
                    myFormDatas.append("zjd", JSON.stringify(this.editzjd));
                    this.$store.commit("postFormDataCustom", {
                      url: "zjdphoto/updatePhototoResultdata", formdata: myFormDatas, callback: resultdata => {
                        if (resultdata.status === "Success") {
                          let newzjd = JSON.parse(resultdata.json);
                          console.log(newzjd);
                          for (let j = 0; j < this.zjds.length; j++) {
                            console.log(this.zjds[j].id,newzjd.id);
                            if (this.zjds[j].id+"" === newzjd.id+"") {
                              this.zjds[j].photos.splice(i, 1, editPhoto);
                              this.$store.commit("notify", {
                                type: resultdata.status.toLowerCase(),
                                message: resultdata.message
                              });
                              break;
                            }
                          }
                        }else{
                          this.$store.commit("notify", {
                            type: resultdata.status.toLowerCase(),
                            message: resultdata.message
                          });
                        }

                      }
                    });
                  }
                }
              });
              break
            }
          }


          this.dialogEditPhototVisible = false;
        } else {
          this.$store.commit("notify", {type: "error", message: "文件名字不能为空！！！"});
        }
      },
      /**
       * 弹出 删除 照片窗口
       *@param zjd
       * @param photo
       */
      showDeletephoto(zjd, photo) {

        this.$store.commit("confirm", {
          message: "是否删除照片：" + photo.name,
          callback: falg => {
            if (falg) {
              this.$store.commit("getCustom", {
                url: "zjdphoto/deletebyid?id=" + photo.id, callback: resultdata => {

                  if (resultdata.status === "Success") {
                    for (let i = 0; i < zjd.photos.length; i++) {
                      let p = zjd.photos[i];
                      if (p.id === photo.id) {
                        zjd.photos.splice(i, 1);
                        break;
                      }
                    }
                  }
                  this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message});
                }
              });
            }
          }
        });

      },
      /**
       * 保存数据 到 数据库
       * @param writezjds
       */
      saveWriteZJDs(writezjds) {
        this.$store.commit("postCustom", {
          url: "/zjd/savezjds", po: writezjds, mark: "zjds", callback: resultdata => {

            this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: "导入成功"});
            if (resultdata.status === "Success") {
              this.dialogTableVisible = false;
              this.init();
            }
          }
        });
      },
      submitUpload(e) {
        this.fileshow = false;
        let files = e.target.files;
        let formData = new FormData();
        // formData重复的往一个值添加数据并不会被覆盖掉，可以全部接收到，可以通过formData.getAll('files')来查看所有插入的数据
        for (let i = 0; i < files.length; i++) {
          // formData.append(files[0].name.substring(0,files[0].name.indexOf("\.")), files[i])
          formData.append(files[i].name, files[i])
        }
        this.$store.commit("postFiles", {
          url: this.action, formData: formData, callback: (resultdata) => {
            if (resultdata.status === "Success") {
              this.writezjds = JSON.parse(resultdata.json);

              if (this.writezjds && this.writezjds.length > 0) {
                this.dialogTableVisible = true;
                this.importshow = true;

              }
            } else {
              this.importshow = false;
              this.$store.commit("notify", {type: resultdata.status.toLowerCase(), message: resultdata.message})
            }
            this.fileshow = true;
          }
        });

      },
      handleRemove(file, fileList) {
        console.log(file, fileList);
      },
      handlePreview(file) {
        this.fileList.push(file);
        console.log(file);
      },
      handleExceed(files, fileList) {
        this.$message.warning(`当前限制选择 3 个文件，本次选择了 ${files.length} 个文件，共选择了 ${files.length + fileList.length} 个文件`);
      },
      beforeRemove(file, fileList) {
        return this.$confirm(`确定移除 ${file.name}？`);
      }
    }
  }
</script>

<style scoped>

  #bottom {
    position: fixed;
    z-index: 0;
    right: 0;
    left: 0;
    height: 40px;
    padding-right: 10px;
    padding-left: 10px;
    border-bottom: 0;
    background-color: #f7f7f7;
    bottom: 0px;
    box-shadow: 0 1px 6px #ccc;
  }

  .demo-table-expand {
    font-size: 0;
  }

  .demo-table-expand label {
    width: 90px;
    color: #99a9bf;
  }

  .demo-table-expand .el-form-item {
    margin-right: 0;
    margin-bottom: 0;
    width: 50%;
  }


</style>
