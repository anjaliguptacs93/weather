import { Component, OnInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs';
import { Store, select } from '@ngrx/store';
import { WeatherService } from '../weather.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort'

export interface Element {
  Day: number;
  HighestTemp: number;
  LowestTemp: number;
  WeatherDescription: string;
}

@Component({
  selector: 'app-forecast',
  templateUrl: './forecast.component.html',
  styleUrls: ['./forecast.component.css']
})

export class ForecastComponent implements OnInit {
  loc$: Observable<string> | undefined;
  loc: string | undefined;
  currentWeather: any = <any>{};
  msg: string | undefined;
  displayedColumns: string[] = ['Day', 'HighestTemp', 'LowestTemp', 'WeatherDescription'];
  orders: Element[] = [];
  @ViewChild(MatSort) sort: MatSort | null | undefined;
  dataSource: MatTableDataSource<Element> | undefined;
  forecast: any;


  constructor(
    private store: Store<any>,
    private weatherService: WeatherService
  ) { }

  ngAfterViewInit() {
    this.loc$ = this.store.pipe(select('loc'));
    this.loc$.subscribe(loc => {
      this.loc = loc;
      this.searchWeather(this.loc);
    })
    if(this.orders){
      this.dataSource = new MatTableDataSource<Element>(this.orders);
    }

  }

  ngOnInit() {
  }
  searchWeather(loc: string) {
    this.msg = '';
    this.currentWeather = {};
    this.weatherService.getCurrentWeather(loc)
      .subscribe(res => {
        this.currentWeather = res;
        sessionStorage.setItem('coord', JSON.stringify(this.currentWeather.coord))
      }, err => {
      }, () => {
        this.searchForecast(loc);
      })
  }
  searchForecast(loc: string) {
    this.weatherService.getForecast()
      .subscribe(res => {
        this.forecast = res
        for (const el of this.forecast.daily) {
          let obj = {
            'Day': el.dt,
            'HighestTemp': el.temp.max,
            'LowestTemp': el.temp.min,
            'WeatherDescription': el.weather[0].description
          }
          this.orders.push(obj);
        }
        if(this.orders){
          this.dataSource = new MatTableDataSource<Element>(this.orders);
        }
      }, err => {
      })
  }
  resultFound() {
    return Object.keys(this.currentWeather).length > 0;
  }

  sortData(event: any) {
    console.log(event);
  }



}