import {Component, Inject, OnInit} from '@angular/core';

import { SelectionService } from '../selection.service';
import {ActivatedRoute} from '@angular/router';
import {WorkspaceService} from '../services/workspace.service';
import {SetStatus} from '../store/actions/auth.login.actions';
import {WorkSpaceDescriptionService} from '../services/work-space-description.service';
import {Area} from '../area';
import {Store} from '@ngrx/store';
import {AppState} from '../store';
import {User} from '../user';
import {CreateWorkspace, LoadUsers} from '../store/actions/workspace.actions';

@Component({
  selector: 'app-events',
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit{
  areas: Area[];
  users: User[];
  private companyId;
  constructor(
      @Inject('areaSelectionService') public areaSelectionService: SelectionService,
      private route: ActivatedRoute,
      private store: Store<AppState>,
      private _workSpaceService: WorkspaceService,
      private  _descriptionService: WorkSpaceDescriptionService,
  ) { }

  ngOnInit(){
      this.route.params.subscribe(params => {
          this.companyId = params['workspaceId'];
          this._workSpaceService.getUsers({companyId: this.companyId})
              .subscribe(
                  (data) => {console.log(data); this.store.dispatch(new LoadUsers(data.users));},
                  (error) => {console.log(error)}
              );
          this._descriptionService.getAreas({companyId: this.companyId})
              .subscribe(
                  (data) => {console.log(data); this.areas = data.areas},
                  (error) => {console.log(error)}
              );
      });
  }


}
