<template>
  <div>
    <div class="block">
      <el-cascader
        v-model="value"
        :options="options"
        :filterable="true"
        :clearable="true"
        @change="handleChange"></el-cascader>
    </div>
  </div>


</template>

<script>
  import axios from 'axios'

  export default {
    name: "AreaSelect",
    data() {
      return {
        value: [],
        options: [],
      };
    },
    created() {

      axios.get("http://127.0.0.1:3333/datav/findalljson")
        .then(res => {
          if (res.data.status === 0) {
            this.setOptions(res.data.data)
          } else {
            console.log(res.data.message);
          }
        });
    },
    methods: {
      handleChange(value) {
        console.log(value);
      },
      setOptions(areas) {
        for (let i = 0; i < areas.length; i++) {
          let area = areas[i];
          area.value=area.adcode;
          area.label = area.name;
          if((area.adcode+"").endsWith("00")){
            area.children = [];
          }

        }
        for (let i = 0; i < areas.length; i++) {
          let area = areas[i];
          let adcode = area.adcode;
          for (let j = i + 1; j < areas.length - 1; j++) {
            let child = areas[j];
            if (adcode == child.parent) {
              area.children.push(areas[j]);
            }
          }
        }
        let array=[];
        array.push(areas[0]);
        this.options = array;
        //console.log(areas[0]);

      },
    }
  }
</script>

<style scoped>

</style>
