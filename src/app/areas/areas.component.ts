import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';

import { Subscription } from 'rxjs/Subscription';

import { AreaService } from '../area.service';
import { Area } from '../area';
import { SelectionService } from '../selection.service';
import { HoodieService } from '../hoodie.service';

@Component({
  selector: 'app-areas',
  templateUrl: './areas.component.html',
  styleUrls: ['./areas.component.scss']
})
export class AreasComponent implements OnInit, OnDestroy {
  areas: Area[] = [];

  editing = false;
  oldServiceName: string;
  oldDescription: string;

  private changeSubscription: Subscription;

  @HostListener('document:click', ['$event']) clickedOutside(evt: MouseEvent) {
    if (this.editing) {
      this.areaService.update(this.areaSelectionService.current);
    }
    this.editing = false;
  }

  @HostListener('click', ['$event']) onClick(evt: MouseEvent) {
    evt.preventDefault();
    evt.stopPropagation();
  }

  @HostListener('keyup.escape', ['$event']) onEsc(evt: KeyboardEvent) {
    this.editing = false;
    this.areaSelectionService.current.serviceName = this.oldServiceName;
    this.areaSelectionService.current.description = this.oldDescription;
  }

  constructor(
    @Inject('areaService') private areaService: AreaService,
    @Inject('areaSelectionService') public areaSelectionService: SelectionService,
    private hoodieService: HoodieService
  ) { }

  trackByAreas(index: number, area: Area): string { return area._id; }

  ngOnInit() {
    this.load();
  }

  private binarySearch(order: number) {
    let low = 0, high = this.areas.length;
    while (low < high) {
      const mid = (low + high) >>> 1; // faster version of Math.floor((low + high) / 2)
      this.areas[mid].order < order ? low = mid + 1 : high = mid;
    }
    return low;
  }

  private load() {
    const filter = item => item.type === 'area';
    this.areas = [];
    this.hoodieService.fetch(filter).then(items => {
      items = items.sort((a, b) => a.order - b.order);
      this.areas = items;
      if (this.areas.length) {
        this.areaSelectionService.select(this.areas[0]);
      }
      console.log('areas loaded', items);

      this.changeSubscription = this.hoodieService.changed$.subscribe(({ eventName, object }) => {
        if (!filter(object)) {
          return;
        }
        console.log('area', eventName, object);
        if (eventName === 'add') {
          const index = this.binarySearch(object.order);
          this.areas.splice(index, 0, object);
        } else {
          const index = this.areas.findIndex(item => item._id === object._id);
          if (eventName === 'update') {
            if (object.order !== index) {
              this.areas.splice(object.order, 0, this.areas.splice(index, 1)[0]);
            } else {
              Object.assign(this.areas[object.order], object);
            }
          } else if (eventName === 'remove') {
            this.areas.splice(index, 1);
          }
        }
      });
    });
  }

  add() {
    let newName: string;
    let i = 0;
    do {
      i++;
      newName = `Area${i}`;
    } while (this.areas.find(item => item.name === newName));
    const area = new Area(newName, this.areas.length);
    this.areaService.add(area);
  }

  areaDropped(evt: any, area: Area, index: number) {
    this.areaSelectionService.select(area);
    if (index < area.order) {
      const to = area.order;
      for (let i = to; i >= index; i--) {
        const a = this.areas[i];
        a.order = i;
        this.areaService.update(a);
      }
    } else {
      const from = area.order;
      for (let i = from; i <= index; i++) {
        const a = this.areas[i];
        a.order = i;
        this.areaService.update(a);
      }
    }
  }

  startEdit() {
    this.editing = true;
    this.oldServiceName = this.areaSelectionService.current.serviceName;
    this.oldDescription = this.areaSelectionService.current.description;
  }

  ngOnDestroy() {
    console.log('areas destroy');
    if (this.changeSubscription) {
      this.changeSubscription.unsubscribe();
      console.log('areas unsubscribed');
    }
  }

}
