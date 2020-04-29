<template>
  <div class='olMap'>
    <h2>{{this.name}}</h2>
    <button @click="test">test</button>
    <div class='map' ref='rootmap'></div>
  </div>
</template>

<script>


  import 'ol/ol.css'
  import {Map, View} from 'ol'
  import mapconfig from './mapconfig'

  export default {
    name: 'olmap',
    data() {
      return {
        name: '地图展示',
        map: null
      }
    },
    mounted() {
      var mapcontainer = this.$refs.rootmap
      this.map = new Map({
        target: mapcontainer,
        layers: mapconfig.streetmap(),
        view: new View({
          projection: 'EPSG:4326',
          center: [mapconfig.x, mapconfig.y],
          zoom: mapconfig.zoom
        })
      })
    },
    methods: {
      test() {
        console.log(shapefile);
        shapefile.open("../shp/ZJD.shp", "../shp/ZJD.dbf", {encoding: "utf-8"})//这里防止乱码，可以用encoding来指定文件的编码。
          .then(source =>
            source.read()
              .then(function log(result) {
                if (result.done) return;
                console.log(result.value);//result.value 为geojson文件
                var feature = geojsonformat.readfeature(result.value);
                sorce1.addFeature(feature);
                return source.read().then(log);
              }))
          .catch(error => console.error(error.stack));
      }
    }
  }
</script>

<style>
  .olMap {
    width: 500px;

  }

  .map {
    height: 500px;
  }

  .ol-attribution {
    display: none
  }

  .ol-zoom {
    display: none
  }

</style>
