<template >
  <div id="main">
    <!-- <img src="../../../static/pics/1-101.png" style="width:70px"> -->
    <el-progress :text-inside="true" :stroke-width="18" :percentage="percentage" status="success" >图片缓存中</el-progress>
    <el-progress :text-inside="true" :stroke-width="18" :percentage="asyncCount" >数据加载中</el-progress>
    <div style="position: absolute;left:50px;top:50px" @click="change" ><h3>{{ count }}</h3></div>
    <div v-if="slidersshow" class="block" style="position: absolute;left:10px;bottom:10px">
      <input ref="sliders" value="0" type="range" min="0" max="550" step="1" @input="sliderchange" @change="sliderchange">
    </div>
    <div v-if="workData.length>0" style="position: absolute;right:90px;bottom:150px" >
      <h3 align="center">上仓工单(时间:05-22 09:04)</h3>
      <table style="border-left:none;border-right:none" border="1px">
        <tr style="boder:none">
          <td align="center" >&emsp;煤堆&emsp;</td>
          <td align="center" >&emsp;煤种&emsp;</td>
          <td align="center" >&emsp;煤仓&emsp;</td>
        </tr>
        <tr v-for="(item,index) in workData" :key="index">
          <td align="center">&emsp;{{ item.stackID }}&emsp;</td>
          <td align="center">&emsp;{{ item.coalName }}&emsp;</td>
          <td align="center">&emsp;{{ item.list }}&emsp;</td>
        </tr>
      </table>
    </div>
    <h2 v-if="show">hello</h2>
    <div v-if="showDialog" :style="PositionModel">
      <table v-if="ModelData.length>0" border="1px">
        <thead>
          <th>编号</th>
          <th>煤种</th>
          <th>煤量</th>
          <th>占比</th>
          <th>颜色</th>
          <th>煤种ID</th>
          <th>时间</th>
        </thead>
        <tbody v-for="(item,index) in ModelDataDeal" :key="item">
          <tr>
            <td>{{ index+1 }}</td>
            <td>{{ item.coalName }}</td>
            <td>{{ item.weight }}</td>
            <td>{{ item.percent }}</td>
            <td :style="{backgroundColor:item.color}"/>
            <td>{{ item.coalId }}</td>
            <td>{{ item.time }}</td>
          </tr>
        </tbody>
    </table></div>
    <div v-if="showDialogstack" :style="PositionModelStack">
      <table v-if="ModelDatastack!=null" border="1px">
        <tr><td>类型</td><td>{{ ModelDatastack.kplace==1?"能检":"前港" }}</td></tr>
        <tr><td>ID</td><td>{{ ModelDatastack.id }}</td></tr>
        <tr><td>煤种</td><td>{{ ModelDatastack.coalname }}</td></tr>
        <tr><td>煤量</td><td>{{ ModelDatastack.Weight }}t</td></tr>
        <tr><td>Qnet<sub>ar</sub></td><td>{{ (ModelDatastack.reports[0].qnetar/0.0041816).toFixed(2) }}kcal/kg</td></tr>
        <tr><td>堆煤日期</td><td>{{ ModelDatastack.ashoretime }}</td></tr>
      </table>
    </div>
  </div>
</template>
<script>
const widths = 80 // 缩放 500 > 80
const scale = 1.45 // 缩放系数
const rail = 12 // 轨道边距

let circleg = null // 转轴
const pianyiArr = [-260, 0, 260]
const pianyiArrs = [260, 0, -260]
let svg = null // 所有元素容器
let MCgg = null // 煤仓的画布
let dace = null
let dace1 = null
let dace3 = null
const dumpArr = ['1-101', '2-102', '1-103', '2-104', '3-201', '4-202', '3-203', '4-204', '5-301', '6-302', '5-303', '6-304']
import * as d3 from 'd3'
import axios from 'axios'
export default {
  data() {
    return {
      slider: 300,
      percentage: 0,
      asyncCount: 0,
      show: false,
      workData: [], // 上仓工单数据
      arrpose: [],			 // 斗轮机和大车位置定位
      coalfeeder: null, // 各仓位煤流量
      beltbalanceshowpi: null,
      GetCerterXY: [],		// 煤堆定位
      heightArr: [], // 获取PNG 图片中高度的数组
      rotate: 0, // 当前面板 旋转角度
      beltShow: null,		// 所有皮带状态
      bunkerWeigth: [],		// 煤仓中的煤种及高度颜色
      beltIdGroup: [], // 皮带动画组，该组中的 ID 会被 变成流动型
      IsEnable: [], // 该煤堆是否还存在余煤
      count: 0, // 运行定时器执行次数
      pngcount: 0,
      group: [], // 24 个煤仓的定位
      ListSelect: [],		// 下拉框中值
      selected: '',			// 下拉框选中时的值
      Isoperation: 0, // 转轴是否在运作
      showDialog: false,		// 是否显示煤仓煤量table 详情信息
      showDialogstack: false, // 是否显示煤堆煤质 详情信息
      ModelData: [], // 点击煤仓时表格数据
      ModelDatastack: null, // 点击煤堆时表格数据
      LmqData: null,			// 淋煤器下落数据源
      shakeshowpi: null, // 堆料 取料直通 状态
      scaleChange: 1,		// tranform 放大倍数
      animatesvgMain: null, // 动画层包裹 svg层
      modelpage: { // 煤仓信息鼠标点击时跟随显示
        pageX: 0,
        pageY: 0
      },
      modelpageStack: { // 煤堆信息鼠标点击时跟随显示
        pageX: 0,
        pageY: 0
      },
      Cirinterval: null // 转轴定时事件
    }
  },
  computed: {
    ModelDataDeal: function() {
      let sum = 0
      this.ModelData.forEach((item) => {
        sum += parseFloat(item.weight)
      })
      this.ModelData.forEach((item) => {
        item.percent = parseFloat(item.weight / sum).toFixed(2) + '%'
      })
      return this.ModelData
    },
    clientWidth: function() {
      return 1884
      // `${document.body.clientWidth}` - 36
    },
    clientHeight: function() {
      return 851
      // `${document.body.clientHeight}` - 86
    },
    PositionModel: function() {
      return 'position: absolute;left: ' + this.modelpage.pageX + 'px;top: ' + this.modelpage.pageY + 'px;background-color: #fff;filter:drop-shadow(5px 5px 10px black)'
    },
    PositionModelStack: function() {
      return 'position: absolute;left: ' + this.modelpageStack.pageX + 'px;top: ' + this.modelpageStack.pageY + 'px;background-color: #fff;filter:drop-shadow(5px 5px 10px black)'
    },
    centreX: function() {
      return (this.clientWidth / 2) - 400
    },
    centreY: function() {
      return (this.clientHeight / 2) + 90
    },
    xunabiSize: function() {
      return 45 * scale
    },
    slidersshow() {
      return this.animatesvgMain !== null
    }

  },
  watch: {
    percentage: function(val) {
      if (val === 100) {
        setTimeout(() => {
          this.$message({
            message: '图片缓存成功',
            type: 'success'
          })
        }, 1000)
      }
    }
  },
  mounted() {
    this.stamppng()
    this.GetForm()
    this.GetDLJPose()
  },
  methods: {
    sliderchange() {
      this.animatesvgMain.transition()
        .delay(0)
        .duration(100)
        .attr('transform', 'translate(' + this.$refs.sliders.value + ',' + this.centreY + ')')
    },
    change() {
      if (this.animatesvgMain != null) {
        this.rotate += 90
        this.animatesvgMain.attr('transform', 'translate(' + this.centreX + ',' + this.centreY + ')rotate(' + this.rotate + ')')
      }
    },
    // 缓存加载图片
    stamppng() {
      for (const item of dumpArr) {
        const img = new Image()
        img.src = '../../../static/pics/' + item + '.png'
        img.onload = () => {
          this.percentage += (100 / 12)
          this.heightArr[item] = img.height * (widths / 500)
          if (this.percentage > 99) {
            this.percentage = 100
          }
        }
      }
    },
    GetForm() {
      // 表单数据
      axios.get('http://192.168.1.42/admin/WebService1.asmx/GetDuiQuContent').then(res => {
        const data = JSON.parse(res.request.responseXML.children[0].innerHTML)
        const list = []
        for (const item in data.worklist) {
          list.push({
            'stackID': item,
            'coalName': data.coalInfo[item].CoalName,
            'list': data.worklist[item].join(',')
          })
        }
        this.workData = list
      })
    },
    GetDLJPose() {
      new Promise((resolve, reject) => {
        axios.get('http://192.168.1.42/threejs/service.asmx/GetCerterXY').then(res => {
          this.asyncCount += 10
          resolve(res)
        })
      }).then(res => {
        this.GetCerterXY = JSON.parse(res.request.responseXML.children[0].innerHTML)
        new Promise((resolve, reject) => {
          axios.get('http://192.168.1.42/threejs/service.asmx/GetDLJPose').then(res => {
            this.asyncCount += 10
            resolve(res)
          })
        }).then(res => {
          this.arrpose = res.request.responseXML.children[0].innerHTML.split(',')
          new Promise((resolve, reject) => {
            axios.get('http://192.168.1.42/threejs/service.asmx/GetRunTimeJson').then(res => {
              this.asyncCount += 10
              resolve(res)
            })
          }).then(res => {
            this.bunkerWeigth = res.data
            new Promise((resolve, reject) => {
              axios.get('http://192.168.1.42/threejs/service.asmx/GetCoalYard').then(res => {
                this.asyncCount += 10
                resolve(res)
              })
            }).then(res => {
              this.IsEnable = JSON.parse(res.request.responseXML.children[0].innerHTML)

              new Promise((resolve, reject) => {
                axios.get('http://192.168.1.42/admin/beltshowpi.json').then(res => {
                  this.asyncCount += 10
                  resolve(res)
                })
              }).then(res => {
                this.beltShow = res.data
                new Promise((resolve, reject) => {
                  axios.get('http://192.168.1.42/admin/plowshowpi/plowcontationpi.json').then(res => {
                    this.asyncCount += 10
                    resolve(res)
                  })
                }).then(res => {
                  console.log(res.data)
                  this.LmqData = res.data
                  new Promise((resolve, reject) => {
                    axios.get('http://192.168.1.42/admin/shakeshowpi.json').then(res => {
                      this.asyncCount += 10
                      resolve(res)
                    })
                  }).then(res => {
                    this.shakeshowpi = res.data
                    new Promise((resolve, reject) => {
                      axios.get('http://192.168.1.42/admin/coalfeedershowpi.json').then(res => {
                        this.asyncCount + 100
                        resolve(res)
                      })
                    }).then(res => {
                      this.coalfeeder = res.data
                      new Promise((resolve, reject) => {
                        axios.get('http://192.168.1.42/admin/beltbalanceshowpi.json').then(res => {
                          this.asyncCount = 100
                          resolve(res)
                        })
                      }).then(res => {
                        if (res.data) {
                          this.beltbalanceshowpi = res.data
                        }
                        setTimeout(() => {
                          this.initSvg() // 画所有皮带和大车
                        }, 1000)
                        // 定时器启动 5000ms
                        // this.animate()
                        // 定时器煤堆图片
                        // this.animatePng()
                      })
                    })
                  })
                })
              })
            })
          })
        })
      }).catch((err) => {
        this.$message.error(err)
      })
    },
    QLDLZTStatus() {
      // 堆料取料 皮带掩盖
      // 一号
      let DLJ0Status = this.shakeshowpi.new_DLJIO0
      if (DLJ0Status.dui === 1) {
        if (d3.select('#DLJDQS2DL')._groups[0][0] === d3.select('#new_pd_6aAboveDL')._groups[0][0]) {
          this.DLQLZTStatusText(2, '堆料', 'DL')
          this.linemaker(svg, 'new_pd_6aAboveDL', pianyiArr[2], pianyiArr[2], -230, (-15 + (170 - this.arrpose[6]) * scale), 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6aAboveDL').attr('y2', (-15 + (170 - this.arrpose[6]) * scale))
        }
      } else {
        d3.select('#new_pd_6aAboveDL').remove()
        d3.select('#DLJDQS2DL').remove()
      }

      if (DLJ0Status.qu === 1) {
        if (d3.select('#DLJDQS2QL')._groups[0][0] === d3.select('#new_pd_6aAboveQL')._groups[0][0]) {
          this.DLQLZTStatusText(2, '取料', 'QL')
          this.linemaker(svg, 'new_pd_6aAboveQL', pianyiArr[2], pianyiArr[2], (15 + (170 - this.arrpose[6]) * scale), 275, 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6aAboveQL').attr('y1', (15 + (170 - this.arrpose[6]) * scale))
        }
      } else {
        d3.select('#new_pd_6aAboveQL').remove()
        d3.select('#DLJDQS2QL').remove()
      }

      if (DLJ0Status.zt === 1) {
        if (d3.select('#DLJDQS2ZT')._groups[0][0] == null) {
          this.DLQLZTStatusText(2, '直通', 'ZT')
        }
      } else {
        d3.select('#DLJDQS2ZT').remove()
      }
      // 二号
      DLJ0Status = this.shakeshowpi.new_DLJIO1
      if (DLJ0Status.dui === 1) {
        if (d3.select('#DLJDQS1DL')._groups[0][0] === d3.select('#new_pd_6bAboveDL')._groups[0][0]) {
          this.DLQLZTStatusText(1, '堆料', 'DL')
          this.linemaker(svg, 'new_pd_6bAboveDL', pianyiArr[1], pianyiArr[1], -230, (-15 + (170 - this.arrpose[7]) * scale), 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6bAboveDL').attr('y2', (-15 + (170 - this.arrpose[7]) * scale))
        }
      } else {
        d3.select('#new_pd_6bAboveDL').remove()
        d3.select('#DLJDQS1DL').remove()
      }

      if (DLJ0Status.qu === 1) {
        if (d3.select('#DLJDQS1QL')._groups[0][0] === d3.select('#new_pd_6bAboveQL')._groups[0][0]) {
          this.DLQLZTStatusText(1, '取料', 'QL')
          this.linemaker(svg, 'new_pd_6bAboveQL', pianyiArr[1], pianyiArr[1], (15 + (170 - this.arrpose[7]) * scale), 275, 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6bAboveQL').attr('y1', (15 + (170 - this.arrpose[7]) * scale))
        }
      } else {
        d3.select('#new_pd_6bAboveQL').remove()
        d3.select('#DLJDQS1QL').remove()
      }

      if (DLJ0Status.zt === 1) {
        if (d3.select('#DLJDQS1ZT')._groups[0][0] === null) {
          this.DLQLZTStatusText(1, '直通', 'ZT')
        }
      } else {
        d3.select('#DLJDQS1ZT').remove()
      }
      // 三号
      DLJ0Status = this.shakeshowpi.new_DLJIO2
      if (DLJ0Status.dui === 1) {
        if (d3.select('#DLJDQS0DL')._groups[0][0] === d3.select('#new_pd_6cAboveDL')._groups[0][0]) {
          this.DLQLZTStatusText(0, '堆料', 'DL')
          this.linemaker(svg, 'new_pd_6cAboveDL', pianyiArr[0], pianyiArr[0], -230, (-15 + (170 - this.arrpose[8]) * scale), 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6cAboveDL').attr('y2', (-15 + (170 - this.arrpose[8]) * scale))
        }
      } else {
        d3.select('#new_pd_6cAboveDL').remove()
        d3.select('#DLJDQS0DL').remove()
      }

      if (DLJ0Status.qu === 1) {
        if (d3.select('#DLJDQS0QL')._groups[0][0] === d3.select('#new_pd_6cAboveQL')._groups[0][0]) {
          this.DLQLZTStatusText(0, '取料', 'QL')
          this.linemaker(svg, 'new_pd_6cAboveQL', pianyiArr[0], pianyiArr[0], (15 + (170 - this.arrpose[8]) * scale), 275, 'red').attr('stroke-width', 9)
        } else {
          d3.select('#new_pd_6cAboveQL').attr('y1', (15 + (170 - this.arrpose[8]) * scale))
        }
      } else {
        d3.select('#new_pd_6cAboveQL').remove()
        d3.select('#DLJDQS0QL').remove()
      }

      if (DLJ0Status.zt === 1) {
        if (d3.select('#DLJDQS0ZT')._groups[0][0] == null) {
          this.DLQLZTStatusText(0, '直通', 'ZT')
        }
      } else {
        d3.select('#DLJDQS0ZT').remove()
      }
    },
    animate() {
      // 运行状态 实时刷新
      setInterval(() => {
        axios.get('http://192.168.1.42/threejs/service.asmx/GetDLJPose').then((res) => {
          console.log('5000ms')
          this.count++
          this.$message({
            message: '定时器执行',
            type: 'success',
            duration: 1000
          })
          // console.log(1)
          // this.initSvg()
          this.arrpose = res.request.responseXML.children[0].innerHTML.split(',')
          this.QLDLZTStatus()
          // 中间位置斗轮机位置定位
          d3.select('#xuanbi').transition().delay(100).duration(500).attr('transform', 'translate(0,0)rotate(' + this.arrpose[1] + ')')
          dace.transition().delay(100).duration(500).attr('transform', 'translate(0,' + ((170 - this.arrpose[7]) * scale) + ')')
          d3.select('#xuanbi1').transition().delay(100).duration(500).attr('transform', 'translate(0,0)rotate(' + this.arrpose[0] + ')')
          dace1.transition().delay(100).duration(500).attr('transform', 'translate(' + pianyiArr[2] + ',' + ((170 - this.arrpose[6]) * scale) + ')')
          d3.select('#xuanbi3').transition().delay(100).duration(500).attr('transform', 'translate(0,0)rotate(' + this.arrpose[2] + ')')
          dace3.transition().delay(100).duration(500).attr('transform', 'translate(' + pianyiArr[0] + ',' + ((170 - this.arrpose[8]) * scale) + ')')
        })

        // 煤仓煤量数据刷新
        axios.get('http://192.168.1.42/threejs/service.asmx/GetRunTimeJson').then(res => {
          this.bunkerWeigth = res.data
          d3.selectAll('#meichangColor').remove()
          this.meichangColor()
        })

        // 皮带状态数据刷新
        axios.get('http://192.168.1.42/admin/beltshowpi.json').then(res => {
          this.beltShow = res.data
          this.beltStatus()
        })
        // 淋煤器 位置
        axios.get('http://192.168.1.42/admin/plowshowpi/plowcontationpi.json').then(res => {
          this.LmqData = res.data
          this.Lmq()
        })
        // 堆取料直通状态切换
        // axios.get('http://192.168.1.42/admin/shakeshowpi.json').then(res => {
        //   this.shakeshowpi = res.data
        // })
        // 24 个煤仓变化 是否运行时变化
        axios.get('http://192.168.1.42/admin/coalfeedershowpi.json').then(res => {
          this.coalfeeder = res.data
          this.coalfeederChange()
        })
      }, 5000)
    },
    Lmq() {
      // 淋煤器状态
      const LmqShow = ['#Lmqtop', '#Lmqbom']
      for (const lmqText in this.LmqData) {
        // console.log(d3.select('#Lmqtop')._groups[0][0])
        // Lmgg=svg.append('g')
        const Lmqindex = ((lmqText.slice(8, 9) - 1) * 6) + lmqText.slice(9, 10).toUpperCase().charCodeAt() - 64
        if (lmqText.slice(10, 11) === 'a') {
          if (d3.select('#Lmqtop')._groups[0][0] === null) {
            svg.append('polyline')
              .attr('id', 'Lmqtop')
              .attr('points', ['0,0', '0,40', '-3,40', '5,50', '13,40', '8,40', '10,0'])
              .attr('transform', 'translate(' + (this.group[24 - Lmqindex] + 79) + ',-420)')
              .attr('stroke-linejoin', 'round')
              .attr('stroke-width', 1)
              .attr('stroke', '#969696')
              .attr('fill', 'red')
          } else {
            d3.select('#Lmqtop').transition()
              .delay(100)
              .duration(1000)
              .attr('transform', 'translate(' + (this.group[24 - Lmqindex] + 79) + ',-420)')
          }
          LmqShow.splice(LmqShow.indexOf('#Lmqtop'), 1)
        } else {
          if (d3.select('#Lmqbom')._groups[0][0] === null) {
            svg.append('polyline')
              .attr('id', 'Lmqbom')
              .attr('transform', 'translate(' + (this.group[24 - Lmqindex] + 79) + ',-400)')
              .attr('points', ['0,0', '0,20', '-3,20', '5,30', '13,20', '8,20', '10,0'])
              .attr('stroke-linejoin', 'round')
              .attr('stroke-width', 1)
              .attr('stroke', '#969696')
              .attr('fill', 'red')
          } else {
            d3.select('#Lmqbom').transition()
              .delay(100)
              .duration(1000)
              .attr('transform', 'translate(' + (this.group[24 - Lmqindex] + 79) + ',-400)')
          }
          LmqShow.splice(LmqShow.indexOf('#Lmqbom'), 1)
        }
      }
      LmqShow.forEach((item) => {
        if (d3.select(item)._groups[0][0] != null) {
          d3.select(item).remove()
        }
      })
    },
    coalfeederChange() {
      // 24个煤仓是否运行状态改变方法
      const datacoalfeeder = Object.keys(this.coalfeeder).sort()
      datacoalfeeder.forEach((item) => {
        const dom = '#coal' + item
        const coalfeed = d3.select(dom)
        if (this.coalfeeder[item] > 1) {
          coalfeed.attr('fill', 'red')
        } else {
          coalfeed.attr('fill', 'green')
        }
      })
    },
    // 画煤仓的外壳
    bunkerGroup() {
      const bunkerGroupg = MCgg.append('g')
      const group = []
      let startX = -380
      for (let f = 1; f < 25; f++) {
        group.push(startX)
        startX += 21.1
        if (f % 6 === 0) {
          startX += 10
        }
      }
      const vm = this
      // const group = [-380, -360, -340, -320, -300, -280, -250, -230, -210, -190, -170, -150, -120, -100, -80, -60, -40, -20, 10, 30, 50, 70, 90, 110]
      bunkerGroupg.selectAll('polyline')
        .data(group)
        .enter()
        .append('polyline')
        .attr('class', 'bunker')
        .attr('points', function(d, i) {
          // console.log(i)
          const point = ['' + d + ',0', '' + d + ',' + ((17 * scale * 3) - 40) + '', '' + (d + 6) + ',' + (17 * scale * 3) + '', '' + (d + 6 * 2) + ',' + (17 * scale * 3) + '', '' + (d + 6 * 3) + ',' + ((17 * scale * 3) - 40) + '', '' + (d + 6 * 3) + ',0']
          // console.log(point)
          return point
        })
        .attr('fill', '#fff')
        .attr('stroke-linejoin', 'round')
        .attr('stroke-width', 1)
        .attr('stroke', '#969696')
        .on('click', function(d, i) {
          console.log(123)
        })

      this.group = group
      this.meichangColor() // 填充煤仓
      const datacoalfeeder = Object.keys(this.coalfeeder).sort()
      const sign = ['F', 'E', 'D', 'C', 'B', 'A']
      bunkerGroupg.selectAll('text')
        .data(group)
        .enter()
        .append('text')
        .text(function(d, i) {
          if (vm.coalfeeder[datacoalfeeder[23 - i]] > 1) {
            vm.circlemarker(bunkerGroupg, 'coal' + datacoalfeeder[23 - i], d + 9.5, 104, 4, 'red')
          } else {
            vm.circlemarker(bunkerGroupg, datacoalfeeder[23 - i], d + 9.5, 104, 4, 'green')
          }
          return sign[i % 6]
        }).attr('x', function(d, i) {
          return d + 5
        }).attr('y', '95')
    },
    // 填充煤仓
    meichangColor() {
      const group = this.group
      const heightBunker = 17 * scale * 3
      const vm = this
      const Jsoncopy = this.bunkerWeigth
      for (let h = 0; h < Jsoncopy.mc.length; h++) {
        Jsoncopy.mc[h].pop()
        const datsaBunker = Jsoncopy.mc[h]
        const colorgroup = MCgg.append('g')
          .attr('id', 'meichangColor')
        colorgroup.selectAll('polyline')
          .data(datsaBunker)
          .enter()
          .append('polyline')
          .attr('class', 'bunker')
          .attr('points', function(d, i) {
            const conv = d.height * scale * 3
            // console.log(conv)
            const cenx = group[23 - h]
            const gap = 1.1
            let point = null
            if (conv < 40) {
              point = ['' + (cenx + gap + (5 - conv * 0.125)) + ',' + (heightBunker - conv) + '', '' + (cenx + 5 + gap + 0.3) + ',' + heightBunker + '', '' + (cenx + gap + 0.3 + 5 * 2) + ',' + heightBunker + '', '' + (cenx + gap + 0.3 + (conv * 0.125) + 5 * 2) + ',' + (heightBunker - conv) + '']
            } else {
              point = ['' + (gap + cenx) + ',' + (heightBunker - conv) + '', '' + (gap + cenx) + ',' + ((17 * scale * 3) - 40) + '', '' + (cenx + 5 + gap) + ',' + (17 * scale * 3) + '', '' + (cenx + gap + 0.3 + 5 * 2) + ',' + (17 * scale * 3) + '', '' + (cenx + 0.3 + gap + 5 * 3) + ',' + ((17 * scale * 3) - 40) + '', '' + (cenx + 0.3 + gap + 5 * 3) + ',' + (heightBunker - conv) + '']
            }
            return point
          })
          .on('click', function(d, i) {
            // vm.clickOut=1
            vm.ModelData = datsaBunker
            vm.modelpage.pageX = (d3.event.pageX - 170)
            vm.modelpage.pageY = (d3.event.pageY - 100)
            vm.showDialog = true
          })
          .on('dblclick', function(d, i) {
            // 双击事件
          })
          .on('mouseover', function(d, i) {
            // 鼠标移入
          })
          .on('mouseout', function(d, i) {
            // 鼠标移出
            vm.showDialog = false
          })
          .attr('fill', function(d, i) {
            return d.color
          })
          .attr('stroke-linejoin', 'round')
          .attr('stroke-width', 1)
          .attr('stroke', '#ffffff')
      }
    },
    beltStatus() {
      this.beltIdGroup = []
      this.ListSelect = []
      // this.Isoperation=0
      for (const item in this.beltShow) {
        this.ListSelect.push(item)
        const stop = this.beltShow[item].stop
        const ing = this.beltShow[item].ing
        const bed = this.beltShow[item].bed
        // 在运行 红色 流动体
        if (ing === 1) {
          this.beltIdGroup.push(item)
        }
        // 正常状态 绿色
        if (stop === 1) {
          d3.select('#' + item)
            .attr('stroke', '#008b45')
            .attr('stroke-dasharray', '0')
        }
        // 在维修 黄色
        if (bed === 1) {
          d3.select('#' + item)
            .attr('stroke', 'yellow')
        }
      }
      if ((this.beltShow['new_pd_11b'].ing === 1) || (this.beltShow['new_pd_11a'].ing === 1)) {
        // 滚轴转动
        if (this.Isoperation === 0) {
          this.animateLinerotate(circleg)
          this.Isoperation = 1
        }
      } else {
        if (this.Isoperation === 1) {
          clearInterval(this.Cirinterval)
          this.Isoperation = 0
        }
      }
      // this.beltIdGroup=this.ListSelect
    },
    positionPng() {
      // 添加煤堆阴影
      const defs = svg.append('defs')
      const coalfilter = defs.append('filter').attr('id', 'coalfilter')
      coalfilter.append('feOffset').attr('result', 'offOut').attr('in', 'SourceAlpha').attr('dx', '4').attr('dy', '4')
      coalfilter.append('feGaussianBlur').attr('result', 'blurOut').attr('in', 'offOut').attr('stdDeviation', '6')
      coalfilter.append('feBlend').attr('in', 'SourceGraphic').attr('in2', 'blurOut').attr('mode', 'normal')
      const vm = this
      for (let t = 0; t < dumpArr.length; t++) {
        const domPng = d3.select('#image' + dumpArr[t].slice(2, 5))
        // console.log(domPng._groups[0][0])
        // if(domPng[0][0]!=null){console.log('true'); domPng.remove()}
        if (this.IsEnable[t].MultiID2 !== '' && this.IsEnable[t].MultiID2 !== null) {
          const pconst = rail + 5
          const position = dumpArr[t].slice(4, 5) % 2 === 0 ? -pconst : pconst
          if (domPng._groups[0][0] === null) {
            console.log(1111)
            svg.append('image')
              .attr('id', 'image' + dumpArr[t].slice(2, 5))
              .attr('class', 'coalImage')
              .attr('xlink:href', '../../../static/pics/' + dumpArr[t] + '.png')
              .attr('stroke', 'blue')
              .attr('stroke-width', 8)
              .attr('width', widths + 'px')
              .attr('x', this.GetCerterXY[2 * t] * scale + pianyiArrs[dumpArr[t].slice(2, 3) - 1] + position - (widths / 2))
              .attr('y', -(this.GetCerterXY[(2 * t) + 1] - 170) * scale - this.heightArr[dumpArr[t]] / 2)
              .on('click', function(d, i) {
                const pageX = (d3.event.pageX - 170)
                const pageY = (d3.event.pageY - 100)
                axios.get('http://192.168.1.42/admin/threejs/service.asmx/GetReport?coalId=' + vm.IsEnable[t].MultiID2).then(res => {
                  vm.ModelDatastack = res.data
                  vm.ModelDatastack.Weight = vm.IsEnable[t].Weight
                  vm.modelpageStack.pageX = pageX
                  vm.modelpageStack.pageY = pageY
                  vm.showDialogstack = true
                })
              })
              .on('mouseout', function(d, i) {
                vm.showDialogstack = false
              })
          } else {
            domPng.attr('xlink:href', '../../../static/pics/' + dumpArr[t] + '.png')
              .attr('x', this.GetCerterXY[2 * t] * scale + pianyiArrs[dumpArr[t].slice(2, 3) - 1] + position - (widths / 2))
              .attr('y', -(this.GetCerterXY[(2 * t) + 1] - 170) * scale - this.heightArr[dumpArr[t]] / 2)
          }
        } else {
          if (domPng._groups[0] != null) {
            domPng.remove()
          }
        }
      }
    },
    initSvg() {
      // 最外面一层 画板 SVG 自适应屏幕收缩
      const svgMain = d3.select('#main').append('svg')
        .attr('viewBox', '0,0,' + this.clientWidth + ',' + this.clientHeight + '')

      this.animatesvgMain = svgMain.append('g')
        .attr('transform', 'translate(' + this.centreX + ',' + this.centreY + ')')
      svg = this.animatesvgMain.append('g')

      MCgg = svg.append('g').attr('transform', 'translate(75,-380)')

      // 辅助线
      // this.linemaker(svg, 'demo', 942, -942, 425.5, -425.5, 'green', true).attr('stroke-width', 1)
      // // this.linemaker(svg, 'demo1', 942, -942, -425.5, 425.5, 'green', true).attr('stroke-width', 1)
      // this.linemaker(svg, 'demox', 942, -942, 0, 0, 'red', true).attr('stroke-width', 1)
      // this.linemaker(svg, 'demoy', 0, 0, -425.5, 425.5, 'red', true).attr('stroke-width', 1)

      this.positionPng()
      this.linemaker(svg, 'new_pd_6b', pianyiArr[1], pianyiArr[1], -230, 275, 'green')
      this.linemaker(svg, 'new_pd_6a', pianyiArr[2], pianyiArr[2], -230, 275, 'green')
      this.linemaker(svg, 'new_pd_6c', pianyiArr[0], pianyiArr[0], -230, 275, 'green')

      // 堆料取料直通
      // this.QLDLZTStatus()

      // 二号斗轮机整体 （悬臂+大车）
      dace = svg.append('g')
      this.rectmaker(dace, 'rectship2', -15, -15, 30, 30)
        .attr('fill', '#ce541f')
        .attr('rx', 10)
        .attr('ry', 10)
      // .attr('y', arrpose[7] - 170)
      this.linemaker(dace, 'xuanbi', 0, 0, -this.xunabiSize, this.xunabiSize, '#f9af87')
        .attr('stroke-linecap', 'round')
        .attr('transform', 'translate(0,0)rotate(' + this.arrpose[1] + ')')
      dace.attr('transform', 'translate(0,' + ((170 - this.arrpose[7]) * scale) + ')')

      // 一号斗轮机整体 （悬臂+大车）
      dace1 = svg.append('g')
      dace1.attr('transform', 'translate(' + pianyiArr[2] + ',0)')
      this.rectmaker(dace1, 'rectship1', -15, -15, 30, 30)
        .attr('fill', '#ce541f')
        .attr('rx', 10)
        .attr('ry', 10)
      // .attr('y', arrpose[7] - 170)
      this.linemaker(dace1, 'xuanbi1', 0, 0, -this.xunabiSize, this.xunabiSize, '#f9af87')
        .attr('stroke-linecap', 'round')
        .attr('transform', 'translate(0,0)rotate(' + this.arrpose[0] + ')')
      dace1.attr('transform', 'translate(' + pianyiArr[2] + ',' + ((170 - this.arrpose[6]) * scale) + ')')

      // 三号斗轮机整体 （悬臂+大车）
      dace3 = svg.append('g')
      dace3.attr('transform', 'translate(' + pianyiArr[0] + ',0)')
      this.rectmaker(dace3, 'rectship3', -15, -15, 30, 30)
        .attr('fill', '#ce541f')
        .attr('rx', 10)
        .attr('ry', 10)
      // .attr('y', arrpose[7] - 170)
      this.linemaker(dace3, 'xuanbi3', 0, 0, -this.xunabiSize, this.xunabiSize, '#f9af87')
        .attr('stroke-linecap', 'round')
        .attr('transform', 'translate(0,0)rotate(' + this.arrpose[2] + ')')
      dace3.attr('transform', 'translate(' + pianyiArr[0] + ',' + ((170 - this.arrpose[8]) * scale) + ')')

      const defs = svg.append('defs')
      const beltfilter = defs.append('filter').attr('id', 'beltfilter').attr('x', '-942').attr('y', '-425.5').attr('filterUnits', 'userSpaceOnUse')
      beltfilter.append('feOffset').attr('result', 'offOut').attr('in', 'SourceAlpha').attr('dx', '0').attr('dy', '0')
      beltfilter.append('feGaussianBlur').attr('result', 'blurOut').attr('in', 'offOut').attr('stdDeviation', '6')
      beltfilter.append('feBlend').attr('in', 'SourceGraphic').attr('in2', 'blurOut').attr('mode', 'normal')

      // 画所有除斗轮机外的皮带
      this.linemaker(svg, 'new_pd_1a', 465, 465, 280, -100, '#008b45') // 1A 皮带
      this.linemaker(svg, 'new_pd_1b', 485, 485, 280, -100, '#008b45') // 1B 皮带
      // 1号中转站
      this.rectmaker(svg, 'rectBelt1', 450, 275, 50, 40)

      this.linemaker(svg, 'new_pd_2a', 385, 450, 285, 285, '#008b45') // 2A 皮带
      this.linemaker(svg, 'new_pd_2b', 385, 450, 305, 305, '#008b45') // 2B 皮带
      // 2号中转站
      this.rectmaker(svg, 'rectBelt2', 335, 275, 50, 40)

      this.linemaker(svg, 'new_pd_3a', 285, 335, 285, 285, '#008b45') // 3A 皮带
      this.linemaker(svg, 'new_pd_3b', 285, 335, 305, 305, '#008b45') // 3B 皮带

      // 3号中转站
      this.rectmaker(svg, 'rectBelt3', 235, 275, 50, 40)

      this.linemaker(svg, 'new_pd_4a', 25, 235, 285, 285, '#008b45') // 4A 皮带
      this.linemaker(svg, 'new_pd_4b', 25, 235, 305, 305, '#008b45') // 4B 皮带

      // 4号中转站
      this.rectmaker(svg, 'rectBelt4', -25, 275, 50, 40)

      this.linemaker(svg, 'new_pd_5a', -235, -25, 285, 285, '#008b45') // 5A 皮带
      this.linemaker(svg, 'new_pd_5b', -235, -25, 305, 305, '#008b45') // 5B 皮带

      // 5号中转站
      this.rectmaker(svg, 'rectBelt5', -285, 275, 50, 40)

      // 6号中转站
      this.rectmaker(svg, 'rectBelt6', -285, -270, 50, 40)
      this.linemaker(svg, 'new_pd_7', -25, -235, -250, -250, '#008b45') // 7 皮带

      // 7号中转站
      this.rectmaker(svg, 'rectBelt7', -25, -270, 50, 40)
      this.linemaker(svg, 'new_pd_8a', 235, 25, -240, -240, '#008b45') // 8A 皮带
      this.linemaker(svg, 'new_pd_8b', 235, 25, -260, -260, '#008b45') // 8B 皮带

      // 8号中转站
      this.rectmaker(svg, 'rectBelt8', 235, -270, 50, 40)
      this.linemaker(svg, 'new_pd_9a', 270, 270, -300, -270, '#008b45') // 9A 皮带
      this.linemaker(svg, 'new_pd_9b', 250, 250, -300, -270, '#008b45') // 9B 皮带

      // 9号中转站
      this.rectmaker(svg, 'rectBelt9', 235, -340, 50, 40)
      this.linemaker(svg, 'new_pd_10a', 270, 270, -390, -340, '#008b45') // 10A 皮带
      this.linemaker(svg, 'new_pd_10b', 250, 250, -390, -340, '#008b45') // 10B 皮带

      // 10号中转站
      this.rectmaker(svg, 'rectBelt10', 235, -430, 50, 40)
      this.linemaker(svg, 'new_pd_11a', -300, 235, -420, -420, '#008b45') // 11A 皮带
      this.linemaker(svg, 'new_pd_11b', -300, 235, -400, -400, '#008b45') // 11B 皮带

      // 最左边转轴
      svg.append('circle')
        .attr('cx', -301)
        .attr('cy', -410)
        .attr('r', 17)
        .attr('fill', 'black')
        .attr('stroke', '#969696')
        .attr('stroke-width', 3)
      circleg = svg.append('g')
        .attr('id', 'gcircle')
        .attr('transform', 'translate(' + -301 + ',' + -410 + ')')
      this.linemaker(circleg, 'zhuanzhou', -19, 19, 0, 0, 'red')
        .attr('stroke-width', 10)
      this.beltStatus() // 皮带状态
      this.bunkerGroup() // 煤仓外壳
      // this.bunkerGroup()
      // 皮带运作线条
      this.animateLineRigth()
      this.belttextflow()
      this.Lmq()
      this.QLDLZTStatus()
      // this.positionPng()
      console.log('end')
    },
    // 皮带流量数据
    belttextflow() {
      const pagexy = {
        'A3': {
          'x': 300,
          'y': 247
        },
        'A10': {
          'x': 300,
          'y': -370
        },
        'B2': {
          'x': 300,
          'y': 227
        },
        'B3': {
          'x': 300,
          'y': 265
        },
        'B10': {
          'x': 300,
          'y': -350
        }
      }
      for (const item in pagexy) {
        svg.append('text')
          .style('font-weight', '400')
          .style('font-size', 15)
          .attr('id', 'flow' + item)
          .attr('fill', 'black')
          .attr('x', pagexy[item].x)
          .attr('y', pagexy[item].y)
          .text(`${item} : ${this.beltbalanceshowpi[item]} `)
      }
    },
    // 画圆
    circlemarker(svg, id, cx, cy, r, fill) {
      svg.append('circle')
        .attr('id', id)
        .attr('cx', cx)
        .attr('cy', cy)
        .attr('r', r)
        .attr('fill', fill)
        .attr('class', 'bunker')
    },
    DLQLZTStatusText(DLJinndex, Text, status) {
      // 显示的 堆料取料分流 文字说明
      svg.append('text')
        .style('font-weight', 'bold')
        .style('font-size', 20)
        .attr('id', 'DLJDQS' + DLJinndex + status)
        .attr('fill', 'red')
        .attr('x', (pianyiArr[DLJinndex] + 10))
        .attr('y', 270)
        .text(Text)
    },
    animateLinerotate(dom) {
      // 填充 滚轴转动的动画
      let r = 0
      this.Cirinterval = setInterval(() => {
        dom.transition()
          .delay(0)
          .duration(100)
          .attr('transform', 'translate(' + -301 + ',' + -410 + ')rotate(' + r + ')')
        r = r - 15
      }, 100)
    },
    animateLineRigth() {
      // 填充 线段动画
      // this.beltIdGroup 为流动状态的 皮带 ID
      let loop = 0
      setInterval(() => {
        this.beltIdGroup.forEach((item) => {
          const dom = d3.select('#' + item)
            .attr('stroke-dasharray', '10,10')
            .attr('stroke', 'red')
          dom.transition()
            .delay(0)
            .duration(50)
            .attr('stroke-dashoffset', loop)
        })
        loop = loop + 5
      }, 150)
    },
    rectmaker(svg, keyId, x, y, width, height) {
      // 生成矩形
      svg.append('rect')
        .attr('x', x)
        .attr('y', y)
        .attr('id', keyId)
        .attr('width', width)
        .attr('height', height)
        .attr('fill', '#969696')
      // .style('filter','drop-shadow(5px 5px 10px black)')
      return d3.select('#' + keyId)
    },
    linemaker() {
      // 生成 线段
      const line = arguments[0].append('line')
      line.attr('class', 'belt')
      for (let i in arguments) {
        i = Number(i)
        switch (i) {
          case 1:
            line.attr('id', arguments[i])
            break
          case 2:
            line.attr('x1', arguments[i])
            break
          case 3:
            line.attr('x2', arguments[i])
            break
          case 4:
            line.attr('y1', arguments[i])
            break
          case 5:
            line.attr('y2', arguments[i])
            break
          case 6:
            line.attr('stroke', arguments[i])
            break
          case 7:
            line.attr('stroke-dasharray', '4,4')
            break
          default:
            break
        }
      }
      line.attr('stroke-width', 8) // 默认宽度stroke
      return line
    }
  }
}
</script>
<style lang="scss" >
.coalImage:hover {
	filter: url('#coalfilter');
}
.belt:hover {
	filter: url('#beltfilter');
}
.bunker:hover {
	filter: url('#beltfilter');
}
svg {
	background-color: #d9edf7;
}
.beltx {
	animation: move1 3s linear forwards;
	stroke-dasharray: 100%, 100%; /* move1*/
	/*animation:move1 3s linear infinite;*/ /* move1*/
}
@keyframes move {
	0% {
		stroke-dasharray: 0, 100%;
	}
	100% {
		stroke-dasharray: 100%, 0;
	}
}
@keyframes move1 {
	0% {
		stroke-dashoffset: 100%;
	}
	100% {
		stroke-dashoffset: 0;
	}
}
</style>
