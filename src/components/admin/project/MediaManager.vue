<template>
  <div>
    <div>
      <el-button style="float: left" type="info" size="mini" icon="el-icon-plus" @click="addMedia()"
                 plain>添加多媒体
      </el-button>
    </div>
    <div style="clear: both"></div>
    <el-table :data="project.medias" :height="tableheight" border
              style="text-align: center;width: 100%"
    >
      <el-table-column v-show="false" type="index" label="序号" width="60px">
        <template slot-scope="scope">
          {{scope.$index +1}}
        </template>
      </el-table-column>
      <el-table-column property="name" label="名称" width="300px">
      </el-table-column>
      <el-table-column label="类型" width="300px">
        <template slot-scope="scope">
          {{scope.row.mediaType| mediaTypeFormat }}
        </template>
      </el-table-column>

      <el-table-column
        label="操作"
      >
        <template slot-scope="scope">
          <el-button type="warning" size="mini" plain
                     @click="deleteMedia(scope.$index,scope.row)"
          >删除
          </el-button>
          <el-button type="succcess" size="mini" plain
                     @click="editMedia(scope.$index,scope.row)"
          >编辑
          </el-button>
        </template>

      </el-table-column>
    </el-table>
    <div>
      <!--添加数据-->
      <el-dialog title="添加多媒体" :visible.sync="addMediaDialogTableVisible" width="400px">

        <!--   <el-form :model="newmedia">
             <el-form-item label="账号" :label-width="formLabelWidth">
               <el-input :disabled="true" v-model="newmedia.name"></el-input>
             </el-form-item>
             <el-form-item label="昵称" :label-width="formLabelWidth">
               <el-input v-model="newmedia.name"></el-input>
             </el-form-item>
           </el-form>-->

        <el-form :model="newmedia">
          <el-form-item label="名称：" :label-width="labelWidth">
            <el-input v-model="newmedia.name"></el-input>
          </el-form-item>
          <el-form-item label="类型：" :label-width="labelWidth">
            <el-select v-model="newmedia.mediaType" clearable placeholder="请选择" style="width: 300px">
              <el-option
                v-for="m in mediaTypes"
                :key="m.mediaType"
                :label="m.message"
                :value="m.mediaType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="addMediaDialogTableVisible = false">取 消</el-button>
          <el-button type="success" @click="submitAddMedia(newmedia)">确 定</el-button>
        </div>
      </el-dialog>
      <!--编辑数据-->
      <el-dialog title="编辑多媒体" :visible.sync="editMediaDialogTableVisible" width="400px">


        <el-form :model="copymedia">
          <el-form-item label="名称：" :label-width="labelWidth">
            <el-input v-model="copymedia.name"></el-input>
          </el-form-item>
          <el-form-item label="类型：" :label-width="labelWidth">
            <el-select v-model="copymedia.mediaType" clearable placeholder="请选择" style="width: 300px">
              <el-option
                v-for="m in mediaTypes"
                :key="m.id"
                :label="m.message"
                :value="m.mediaType">
              </el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="editMediaDialogTableVisible = false">取 消</el-button>
          <el-button type="success" @click="submitEditMedia(copymedia)">确 定</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  export default {
    name: "MediaManager",
    props: ['currentproject'],
    data() {
      return {
        tableheight: 0,
        project: {},
        addMediaDialogTableVisible: false,
        editMediaDialogTableVisible: false,
        mediaTypes: [],
        newmedia: {},//新添加的多媒体
        copymedia: {},//编辑使用的副本
        labelWidth: "60px",
      }
    },
    mounted() {
      this.tableheight = 500;
    },
    created() {
      this.tableheight = this.$store.getters.getWindowHeight - 100;
      this.project = JSON.parse(JSON.stringify(this.currentproject));
      this.init(this.project);
    },
    filters: {
      /**
       *
       * @param mediaType
       */
      mediaTypeFormat(mediaType) {
        let result = "";
        switch (mediaType) {
          case 0:
            result = "照片";
            break;
          case 1:
            result = "视频";
            break;
          case  2:
            result = "语音";
            break;
          default:
            result = "有问题";
            break;
        }
        return result;
      },
    },
    methods: {

      editMedia(index, media) {
        this.copymedia = JSON.parse(JSON.stringify(media));
        this.editMediaDialogTableVisible = true;
      },
      //提交编辑media
      submitEditMedia(media) {
        let index=-1;
        if (this.checkMedia(media)) {
          //检查内容是否被更改
          for (let oldmedia of this.project.medias) {
            if (oldmedia.id == media.id) {
              index = this.project.medias.indexOf(oldmedia);
              //检查内容是否被更改
              if(JSON.stringify(oldmedia) == JSON.stringify(media)){
                this.$store.commit("showMessageBox", {
                  type: "warning",
                  message: "内容没有修改不用提交"
                });
                return;
              }
            } else {
              //检查信息是否重复
              if (!this.checkMeidaRepeat(oldmedia, media)) {
                return;
              }
            }
          }
          this.$store.commit("postCustom", {
            url: "media/updatemedia",
            mark: "media",
            po: media,
            callback: resultData => {
              if (resultData.status === "Success") {
                let newmedia = JSON.parse(resultData.json);
                if(index !== -1){
                  this.project.medias.splice(index,1,newmedia);
                }
                this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "修改成功"});
                this.editMediaDialogTableVisible = false;
              } else {
                this.$store.commit("showMessageBox", {
                  type: resultData.status,
                  message: resultData.message
                });
              }
            }
          });

        }

      },
      deleteMedia(index, media) {
        this.$store.commit("confirm", {
          type: "warning",
          message: "确定要删除 '" + media.name + "' 吗？",
          callback: flag => {
            if (flag) {
              this.$store.commit("getCustom", {
                url: "media/deletebyid?mediaid=" + media.id,
                callback: resultData => {
                  if (resultData.status === "Success") {
                    this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "删除成功"});
                    this.project.medias.splice(index, 1);
                  } else {
                    this.$store.commit("showMessageBox", {
                      type: resultData.status,
                      message: resultData.message
                    });
                  }
                }
              });
            }
          }
        });

      },
      addMedia() {
        this.newmedia = {};
        this.addMediaDialogTableVisible = true;
      },
      checkMedia(media) {
        if (media.mediaType === undefined || media.name === undefined) {
          this.$store.commit("showMessageBox", {
            type: "error",
            message: "信息没有填写完整"
          });
          return false;
        }
        return true;
      },
      //检查media是否重复
      checkMeidaRepeat(oldmedia, newmedia) {
        if (oldmedia.name == newmedia.name && oldmedia.mediaType == newmedia.mediaType) {
          this.$store.commit("showMessageBox", {
            type: "error",
            message: "名称和类型不能同时重复！！！"
          });
          return false;
        }
        return true;
      },
      /**
       * 提交多媒体
       * @param media
       */
      submitAddMedia(media) {
        if (this.checkMedia(media)) {
          //名称和

          for (let oldmedia of this.project.medias) {

            if (!this.checkMeidaRepeat(oldmedia, media)) {
              return;
            }

          }
          this.$store.commit("postCustom", {
            url: "media/addmedia?projectid=" + this.project.id,
            mark: "media",
            po: media,
            callback: resultData => {
              if (resultData.status === "Success") {
                let newmedia = JSON.parse(resultData.json);
                this.project.medias.push(newmedia);
                this.$store.commit("notify", {type: resultData.status.toLowerCase(), message: "添加成功"});
                this.addMediaDialogTableVisible = false;
              } else {
                this.$store.commit("showMessageBox", {
                  type: resultData.status,
                  message: resultData.message
                });
              }

            }
          });

        }

      },
      init(project) {
        //找项目定义的多媒体集合
        this.$store.commit("getCustom", {
          url: "media/findmediatypes",
          callback: resultData => {
            if (resultData.status === "Success") {
              this.mediaTypes = JSON.parse(resultData.json);
            } else {
              this.$store.commit("showMessageBox", {
                type: resultData.status.toLowerCase(),
                message: resultData.message
              });
            }
          }
        });
        //查询所有的多媒体文件
        this.$store.commit("getCustom", {
          url: "media/findmedias?projectid=" + this.project.id,
          callback: resultData => {
            if (resultData.status === "Success") {
              this.project.medias = JSON.parse(resultData.json);
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
  }
</script>

<style scoped>

</style>
