import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as _ from 'lodash';
import { AppService } from 'src/app/app.service';

@Component( {
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: [ './search.component.scss' ]
} )
export class SearchComponent implements OnInit {

  searchResults: SearchResponseType;
  sliceLimit = 10;
  appsStats: any[] = [];
  appsList: any[] = [];
  filteredApps: any[] = [];
  sortOrder: string;
  query: string;
  start = 0;
  rows = 10;
  loading = true;
  responseTime: string;
  appFilterActive = false;
  appSortActive = false;
  selectedOrderName = 'Sort';
  sortList = [ {
    name: 'Newest First',
    filter: 'desc',
  },
  {
    name: 'Oldest First',
    filter: 'asc',
  } ];

  constructor(
    private appService: AppService,
    private route: ActivatedRoute,
  ) {
    this.route.queryParamMap.subscribe( params => {
      this.query = params.get( 'query' );
    } );
  }

  async ngOnInit(): Promise<void> {
    await this.search( this.query, this.start, this.rows ).then( () => this.loading = false );
    await this.generateAppFilter();
  }

  search = ( query, start, rows ) => {
    const startTime = new Date().getTime();
    return this.appService.search( query, start, rows ).then( searchResponse => {
      this.responseTime = (( new Date().getTime() - startTime ) / 1000).toFixed(2) + ' Seconds';
      if ( !this.searchResults) {
        this.searchResults = searchResponse;
      } else {
        this.searchResults.response.docs = this.searchResults.response.docs.concat( searchResponse.response.docs );
      }
    } );
  }

  generateAppFilter = (): void  => {
    this.appsStats = [];
    this.searchResults?.response?.docs?.map( res => {
      this.appsStats.push( res.content_type );
    } );
    this.appsList = _.map( _.groupBy( this.appsStats ), ( value, key ): any => {
      return {
        content_type: key,
        icon: this.searchResults?.response?.docs?.filter( res => res?.content_type === key )[ 0 ].icon,
        count: value.length,
        selected: false
      };
    } );
    this.filteredApps = [];
  }

  showMore = async () => {
    this.start += this.rows;
    await this.search( this.query, this.start, this.rows ).then( () => this.loading = false );
    this.sliceLimit = this.start + this.rows;
    await this.generateAppFilter();
  }

  selectedApps = (): void  => {
    this.filteredApps = _.compact( this.appsList.map( app => {
      if ( app.selected ) {
        return app.content_type;
      }
    } ) );
  }

  orderFilter = ( orderType: string, orderName: string ): void  => {
    this.selectedOrderName = orderName;
    if ( orderType === 'desc' ) {
      this.sortOrder = '-createdDate';
    } else if ( orderType === 'asc' ) {
      this.sortOrder = 'createdDate';
    }
  }

  openFeedbackPanel = (): void  => {
    ( document as any ).querySelector( 'opc-feedback' ).toggle();
  }
}
