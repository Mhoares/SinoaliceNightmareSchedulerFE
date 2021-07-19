import {Component, OnInit} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {Debuff, SkillResult, Weapon} from "../../shared/weapon.class";
import {DetailsSupport, ElementChartParameters, Grid} from "../../shared/grid.class";
import {FormBuilder} from "@angular/forms";
import {AnalyzerService} from "../analyzer.service";
import {AnalyzerConstants, Jobs} from "../../shared/analyzer.constants";
import {Label, monkeyPatchChartJsLegend, monkeyPatchChartJsTooltip, SingleDataSet} from "ng2-charts";
import {ChartDataSets, ChartFontOptions, ChartOptions, ChartType, RadialChartOptions} from "chart.js";
import {Attribute} from "../../shared/nightmare.model";


@Component({
  selector: 'app-grid-details',
  templateUrl: './grid-details.component.html',
  styleUrls: ['./grid-details.component.sass']
})
export class GridDetailsComponent implements OnInit {
  currentGrid: BehaviorSubject<Grid>
  grid?: Grid
  currentSkr?: SkillResult
  rounds = 6
  support = false
  isPieChartEnabled = false
  selectedElement = 0
  burst: Map<Attribute | number, SkillResult | undefined> = new Map<Attribute | number, SkillResult | undefined>()
  isRadarChartEnabled: boolean = false
  selectedChart = 'weapons by element'
  showBurst: boolean = false
  currentElements = new Map<Attribute, {
    result: SkillResult,
    weapons: Weapon[]
  }>()
  elementNames = ["", "Fire", "Water", "Wind"]
  public pieChartLabels: Label[] = [];
  public pieChartData: SingleDataSet = [];
  public pieChartType: ChartType = 'pie';
  public pieChartLegend = false;
  public pieChartPlugins = [];
  public pieChartOptions: ChartOptions = {
    responsive: true,

  };
  public pieChartColors = [
    {
      backgroundColor: []
    },
  ];
  public radarChartOptions: RadialChartOptions = {
    responsive: true,
    scale: {
      gridLines: {
        color: 'rgb(176,190,197)'
      },
      angleLines: {
        color: 'rgb(176,190,197)'
      },
      pointLabels: {
        fontColor: 'rgb(176,190,197)'
      },
      ticks: {
        fontColor: 'white',
        backdropColor: 'rgb(66,66,66)'
      }
    },
  };


  public radarChartData: ChartDataSets[] = [];
  public radarChartType: ChartType = 'radar';


  constructor(private service: AnalyzerService, private fb: FormBuilder) {
    this.currentGrid = this.service.grid
    monkeyPatchChartJsTooltip();
    monkeyPatchChartJsLegend();


  }

  ngOnInit(): void {
    this.currentGrid?.asObservable().subscribe(g => {
      this.grid = g
      this.grid._skillResult$.subscribe(skr => this.currentSkr = skr)
      this.grid.elements.asObservable().subscribe(e => {
          this.currentElements = e
          this.setCharts()
          this.setBursts()

        }
      )
      this.support = this.grid.supports
      this.isPieChartEnabled = false
      this.isRadarChartEnabled = false
      this.setCharts()
      this.grid.change.subscribe(() => {
        this.setCharts()
        this.setBursts()

      })
      console.log(this.currentBurst)

    })


  }

  setBursts() {
    this.burst.set(0, this.getBurst(undefined))
    this.burst.set(Attribute.Fire, this.getBurst(Attribute.Fire))
    this.burst.set(Attribute.Wind, this.getBurst(Attribute.Wind))
    this.burst.set(Attribute.Water, this.getBurst(Attribute.Water))
  }

  get chartNames(): string[] {

    return this.chartsByJob()
  }

  get currentBurst(): Map<Attribute | number, SkillResult | undefined> {
    return this.burst
  }

  chartsByJob(): string[] {
    if (this.grid && this.grid.job == Jobs.Cleric && !this.selectedElement) {
      return ["overall burst",'weapons by element', 'recover by elements']
    }
    if (this.isBufforDebbuff() && !this.selectedElement) {
      return ['overall',
        "overall burst",
        'weapons by element',
        "P.DEF Buff by elements",
        "P.DEF Debuff by elements",
        "P.ATK Buff by elements",
        "P.ATK Debuff by elements",
        "M.DEF Buff by elements",
        "M.DEF Debuff by elements",
        "M.ATK Buff by elements",
        "M.ATK Debuff by elements"]
    } else if (this.selectedElement && this.isBufforDebbuff()) {
      return ['overall']
    }
    if (this.vg && !this.selectedElement) {
      return ["overall burst",'damage by elements', 'weapons by element']
    }
    return []
  }

  chartRegistry = ['weapons by element',
    'recover by elements',
    "overall",
    "damage by elements",
    "P.DEF Buff by elements",
    "P.DEF Debuff by elements",
    "P.ATK Buff by elements",
    "P.ATK Debuff by elements",
    "M.DEF Buff by elements",
    "M.DEF Debuff by elements",
    "M.ATK Buff by elements",
    "M.ATK Debuff by elements",
    "overall burst"
  ]


  selectChart(name: string) {
    const index = this.chartRegistry.indexOf(name)
    if (index == 0) {
      this.elementsChart({weapons: true})
    } else if (index == 1 || index == 3) {
      this.elementsChart()
    } else if (index == 2) {
      this.overallChart()
    } else if (index == 4) {
      this.elementsChart({pdef: true})
    } else if (index == 5) {
      this.elementsChart({pdef: true, debuff: true})
    } else if (index == 6) {
      this.elementsChart({patk: true})
    } else if (index == 7) {
      this.elementsChart({patk: true, debuff: true})
    } else if (index == 8) {
      this.elementsChart({mdef: true})
    } else if (index == 9) {
      this.elementsChart({mdef: true, debuff: true})
    } else if (index == 10) {
      this.elementsChart({matk: true})
    } else if (index == 11) {
      this.elementsChart({matk: true, debuff: true})
    } else if (index == 12) {
      this.generateOverallRadarChart()
    }
    if (index == 2 && this.selectedElement) {
      this.overallChart(this.selectedElement)
    }

  }

  setCharts() {
    if (this.chartNames.indexOf(this.selectedChart) == -1)
      this.selectedChart = this.chartRegistry[0]
    this.selectChart(this.selectedChart)

  }

  get jobs(): typeof Jobs {
    return Jobs
  }

  get elements(): Map<Attribute, { result: SkillResult, weapons: Weapon[] }> {
    return this.currentElements
  }

  debuffColor(data: number): string {
    let r = Math.round(83 + (255 - 83) * (data / 100))
    let g = Math.round(131 + (255 - 131) * (data / 100))
    let b = Math.round(167 + (255 - 167) * (data / 100))

    return `rgb(${r}, ${g}, ${b})`
  }

  buffColor(data: number): string {
    let r = Math.round(219 + (255 - 219) * (data / 100))
    let g = Math.round(115 + (255 - 115) * (data / 100))
    let b = Math.round(66 + (255 - 66) * (data / 100))

    return `rgb(${r}, ${g}, ${b})`
  }

  elementColor(attribute: Attribute, data: number, max: number, alpha = false): string {
    let r = 221
    let g = 145
    let b = 113
    const shade = Math.round((data / max) * 0.3)
    if (attribute == Attribute.Wind) {
      r = 198
      g = 234
      b = 196
    }
    if (attribute == Attribute.Water) {
      r = 170
      g = 200
      b = 204
    }
    r *= (1 - shade)
    g *= (1 - shade)
    b *= (1 - shade)
    if (alpha) {
      return `rgba(${r}, ${g}, ${b},0.2)`
    }

    return `rgb(${r}, ${g}, ${b})`
  }

  supportState() {
    if (this.grid) {
      this.grid.supports = this.support
      this.grid.change.next()
    }

  }

  get range() {
    return Array.from(Array(20).keys())
  }

  get vg(): boolean {
    const job = this.grid?.job
    const random = AnalyzerConstants.VGWeapons[0]
    if (job) {
      return AnalyzerConstants.Jobs[job].canEquip.indexOf(random) != -1
    }
    return false

  }

  isBufforDebbuff(): boolean {
    return this.jobs.Minstrel == this.grid?.job || this.jobs.Sorcerer == this.grid?.job
  }

  existBuff(): boolean {
    return this.skillResult &&
      (this.skillResult?.patk > 0
        || this.skillResult?.pdef > 0
        || this.skillResult?.mdef > 0
        || this.skillResult?.matk > 0)
      || false
  }


  get aids(): DetailsSupport[] | undefined {
    let tmp: DetailsSupport[] | undefined
    if (this.isBufforDebbuff() && this.grid)
      tmp = Array.from(this.grid?.supportBoon.values());
    if (this.grid && this.grid.job == Jobs.Cleric)
      tmp = Array.from(this.grid?.recoverySupport.values());
    if (this.grid && this.vg)
      tmp = Array.from(this.grid.dauntlessCourage.values());
    return tmp
  }

  get skillResult(): SkillResult | undefined {

    return this.currentSkr
  }

  applyRounds(stat: number): number {
    return stat * this.rounds
  }

  get totalBoost(): number {
    let tmp = 0
    if (this.aids)
      tmp = this.aids.reduce((a, b) => {
        return a + b.boost
      }, tmp)
    return tmp
  }

  get debuffTotal(): number {
    let tmp = 0
    const debuff = this.skillResult && this.skillResult.debuff
    if (debuff) {
      tmp = debuff.matk + debuff.mdef + debuff.pdef + debuff.patk
    }
    return tmp
  }

  get buffTotal(): number {
    let tmp = 0
    const buff = this.skillResult
    if (buff) {
      tmp = buff.matk + buff.mdef + buff.pdef + buff.patk
    }
    return tmp
  }

  get total(): number {

    return this.debuffTotal + this.buffTotal
  }

  getElement(attributte: Attribute, debuff = false): SkillResult | Debuff | undefined {
    let tmp: SkillResult | Debuff | undefined
    const total = this.elements.get(attributte)
    if (total && total.result && !debuff)
      tmp = total.result
    else if (debuff && total)
      tmp = total.result.debuff
    return tmp
  }

  overallChart(attribute?: Attribute) {
    let tmp: Map<string, number> = new Map<string, number>()
    let chart: any
    let current: SkillResult | Debuff | undefined = this.skillResult
    let total = this.total
    let debuff = this.skillResult && this.skillResult.debuff
    if (attribute) {
      current = this.getElement(attribute)
      debuff = this.getElement(attribute, true)
      if (current && debuff) {
        total = current.patk + current.matk + current.pdef + current.mdef
        total += debuff.pdef + debuff.mdef + debuff.patk + debuff.matk
      }
    }

    if (current) {
      tmp.set("Buff P.ATK", Math.round((current.patk / total) * 100))
      tmp.set("Buff M.ATK", Math.round((current.matk / total) * 100))
      tmp.set("Buff M.DEF", Math.round((current.mdef / total) * 100))
      tmp.set("Buff P.DEF", Math.round((current.pdef / total) * 100))
    }

    if (debuff) {
      tmp.set("Debuff P.ATK", Math.round((debuff.patk / total) * 100))
      tmp.set("Debuff M.ATK", Math.round((debuff.matk / total) * 100))
      tmp.set("Debuff M.DEF", Math.round((debuff.mdef / total) * 100))
      tmp.set("Debuff P.DEF", Math.round((debuff.pdef / total) * 100))
    }
    this.setPieChart(tmp)

  }

  elementsChart(parameters?: ElementChartParameters) {
    let tmp: Map<string, number> = new Map<string, number>()
    let chart: any

    if (this.grid && this.grid.job == Jobs.Cleric && !parameters)
      this.elements.forEach((result, element) => {
        if (this.skillResult)
          tmp.set(this.elementNames[element] + " Heal", Math.round((result.result.recover / this.skillResult.recover) * 100))
      })
    if (this.vg && !parameters)
      this.elements.forEach((result, element) => {
        if (this.skillResult)
          tmp.set(this.elementNames[element] + " Damage", Math.round((result.result.damage / this.skillResult.damage) * 100))
      })
    if (parameters && parameters.weapons) {
      this.elements.forEach((result, element) => {
        if (this.skillResult)
          tmp.set(this.elementNames[element] + " Weapons", result.weapons.length)
      })


    }


    if (this.isBufforDebbuff() && parameters)
      this.elements.forEach((result, element) => {
        let total: any = this.skillResult
        let tmplabel = ""
        const dbuff = parameters.debuff && result.result.debuff
        let value = 0
        let all = 0
        let current: SkillResult | Debuff = result.result
        if (dbuff && total) {
          current = dbuff
          total = total.debuff
        }
        if (parameters.pdef && total) {
          value = current.pdef
          all = total.pdef
          tmplabel = "P.DEF"
        }
        if (parameters.patk && total) {
          value = current.patk
          all = total.patk
          tmplabel = "P.ATK"
        }
        if (parameters.mdef && total) {
          value = current.mdef
          all = total.mdef
          tmplabel = "M.DEF"
        }
        if (parameters.matk && total) {
          value = current.matk
          all = total.matk
          tmplabel = "M.ATK"
        }
        if (current && total && all) {
          tmp.set(`${this.elementNames[element]} ${tmplabel} `, Math.round((value / all) * 100))
        }

      })


    this.setPieChart(tmp)

  }

  setPieChart(tmp: Map<string, number>) {
    const chart: any = this.generateChart(tmp, 'pie')
    if (chart.label.length) {
      this.pieChartLabels = chart.label
      this.pieChartData = chart.data
      this.pieChartColors = chart.color
      this.isPieChartEnabled = true
      this.isRadarChartEnabled = false
    }
  }


  generateChart(data: Map<string, number>, type: ChartType) {
    let tmpData: SingleDataSet = []
    let tmpLabels: Label[] = []
    let tmpChartColors = [
      {
        backgroundColor: new Array<string>()
      }
    ];
    let max = 0
    data.forEach(data => max += data)
    data.forEach((data, key) => {
      if (data) {
        tmpData.push(data)
        tmpLabels.push(key)
        tmpChartColors[0].backgroundColor.push(this.generateColor(data, key, max))
      }

    })
    if (type)
      this.pieChartType = type
    if (!tmpLabels.length)
      this.isPieChartEnabled = false
    return {data: tmpData, label: tmpLabels, color: tmpChartColors}
  }

  isBuffLabel(key: string): boolean {
    return key.toLocaleLowerCase().includes('buff')
  }

  isDebuffLabel(key: string): boolean {
    return key.toLocaleLowerCase().includes('debuff')
  }

  generateColor(data: number, key: string, max: number): string {
    let tmp = ""
    let element = this.findElement(key)
    if (!element && this.isBuffLabel(key)) {
      tmp = this.buffColor(data)
    }
    if (!element && this.isDebuffLabel(key)) {
      tmp = this.debuffColor(data)
    }
    if (element)
      tmp = this.elementColor(element, data, max)
    return tmp
  }

  findElement(key: string): Attribute | undefined {
    let index = -1
    this.elementNames.forEach((name, i) => {
      const found = name && key.includes(name)
      if (found)
        index = i

    })
    if (index != -1)
      return index
    return undefined
  }

  getBurst(attribute?: Attribute): SkillResult | undefined {

    return this.grid?.calculateBurst(attribute)
  }

  getTotalBurst(): SkillResult {
    let total = this.currentBurst.get(0)
    if (!total) {
      total = AnalyzerConstants.voidSKillResult
    }
    return total

  }

  get totalBurstBuff(): number {
    return this.getTotalBurst().patk
      + this.getTotalBurst().matk
      + this.getTotalBurst().mdef
      + this.getTotalBurst().pdef
  }

  get totalBurstDeBuff(): number {
    const debuff = this.getTotalBurst().debuff
    return (debuff?.patk || 0)
      + (debuff?.matk || 0)
      + (debuff?.mdef || 0)
      + (debuff?.pdef || 0)
  }

  public radarChartLabels: Label[] = ['Buff M.ATK'
    , 'Buff P.ATK'
    , 'Buff M.DEF'
    , 'Buff P.DEF'
    , 'Debuff P.ATK'
    , 'Debuff M.ATK'
    , 'Debuff M.DEF'
    , 'Debuff P.DEF'];

  generateOverallRadarChart() {
    const burst = this.currentBurst
    this.radarChartData = []
    this.radarChartLabels = ['Buff M.ATK'
      , 'Buff P.ATK'
      , 'Buff M.DEF'
      , 'Buff P.DEF'
      , 'Debuff P.ATK'
      , 'Debuff M.ATK'
      , 'Debuff M.DEF'
      , 'Debuff P.DEF']
    if (!this.isBufforDebbuff()) {
      this.radarChartLabels = ['Fire'
        , 'Water'
        , 'Wind']
    }
    if (burst && this.isBufforDebbuff()) {
      burst.forEach((value, key) => {
        if (value && key) {

            this.radarChartData.push(
              {
                label: this.elementNames[key],
                data: [value.matk,
                  value.patk,
                  value.mdef,
                  value.pdef,
                  value.debuff?.patk,
                  value.debuff?.matk,
                  value.debuff?.mdef,
                  value.debuff?.pdef],
                fill: true,
                backgroundColor: this.elementColor(key, 20, 100, true),
                borderColor: this.elementColor(key, 20, 100),
                pointBackgroundColor: this.elementColor(key, 20, 100),
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: this.elementColor(key, 20, 100)
              },
            )


        }
      })
    }else if(burst){
      this.radarChartData.push(
        {
          label:this.overallBurstLabel(),
          data: this.overallBurstData(burst),
          fill: true,
          backgroundColor: "rgba(194,24,91,0.2)",
          borderColor: "rgb(194,24,91)",
          pointBackgroundColor:"rgb(194,24,91)" ,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: "rgb(194,24,91)"
        },
      )

    }
    if (this.radarChartData.length) {
      this.isPieChartEnabled = false
      this.isRadarChartEnabled = true
    }


  }
  overallBurstLabel():string{
    let label = "Heal"
    if (this.vg)
      label = "Damage"
    return label
  }
  overallBurstData(burst: Map<number, SkillResult|undefined>): (undefined|number)[]{
    let fire = burst.get(Attribute.Fire)?.damage
    let water = burst.get(Attribute.Water)?.damage
    let wind = burst.get(Attribute.Wind)?.damage
    if(!this.vg){
       fire = burst.get(Attribute.Fire)?.recover
       water = burst.get(Attribute.Water)?.recover
       wind = burst.get(Attribute.Wind)?.recover
    }
    return [fire,water, wind]

  }


}
