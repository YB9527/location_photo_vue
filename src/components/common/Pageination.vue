<template>
  <!-- -->
  <div class="page-bar">
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="searchcustom.pageindex"
      :page-sizes="pagesizes"
      :page-size="searchcustom.limit"
      layout="total, sizes, prev, pager, next, jumper"
      prev-text="上一页"
      next-text="下一页"
      :total="searchcustom.total"
      :hide-on-single-page="false"
    >
    </el-pagination>

  </div>

</template>

<script>
  export default {
    name: "Test",
    data() {
      return {
        pagesizes: [20, 200, 300, 400,5000],
      }
    },
    props: ['searchcustom'],
    mounted() {

     /* for (let pagesize of this.pagesizes) {
        if (pagesize * 1 > this.searchcustom.limit * 1) {
          console.log(this.searchcustom.limit);
          this.pagesizes.splice(this.pagesizes.indexOf(pagesize), 0, this.searchcustom.limit);
          break;
        }
      }

      for (let pagesize of this.pagesizes) {
        if (pagesize * 1 > this.searchcustom.total * 1) {
          this.pagesizes.splice(this.pagesizes.indexOf(pagesize), 0, this.searchcustom.total);
          break;
        }


      }*/
    },
    created() {


    },
    methods: {
      handleSizeChange(val) {
        this.searchcustom.limit = val;
      },
      handleCurrentChange(val) {
        this.searchcustom.pageindex = val;
      },

    },

  }
</script>

<style scoped>


</style>
