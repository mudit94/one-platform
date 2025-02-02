import { Component, OnInit } from '@angular/core';
import { environment } from 'environments/environment';
import { ActivatedRoute } from '@angular/router';
import { PlaygroundService } from 'app/playground/playground.service';
import { Subject, Subscription } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { takeUntil } from 'rxjs/operators';

const Ansi = require('ansi-to-html');
@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  document: Document;
  sites = '';
  loading = false;
  showScore = false;
  toggleModal = false;
  selectedPreset = 'lighthouse:recommended';
  presets = [
    {
      name: 'All',
      value: 'lighthouse:all',
    },
    {
      name: 'Recommended',
      value: 'lighthouse:recommended',
    },
    {
      name: 'No PWA',
      value: 'lighthouse:no-pwa',
    },
  ];
  auditProgress = '';
  auditId: string;
  convert = new Ansi();
  lhciScores = [
    {
      name: 'Performance',
      label: 'performance',
      score: 0,
      class: null,
    },
    {
      name: 'Accessibility',
      label: 'accessibility',
      score: 0,
      class: null,
    },
    {
      name: 'Best Practices',
      label: 'bestPractices',
      score: 0,
      class: null,
    },
    {
      name: 'SEO',
      label: 'seo',
      score: 0,
      class: null,
    },
    {
      name: 'PWA',
      label: 'pwa',
      score: 0,
      class: null,
    },
  ];
  projects = [];
  projectBranches = [];
  isFetchingProjects = false;
  isFetchingBranches = false;

  destroySub: Subject<boolean> = new Subject<boolean>();

  // upload form management
  auditUploadForm = new FormGroup({
    project: new FormControl('', [
      Validators.required,
      this.whitespaceValidator,
    ]),
    branch: new FormControl('', [
      Validators.required,
      this.whitespaceValidator,
    ]),
    buildToken: new FormControl('', [
      Validators.required,
      this.whitespaceValidator,
    ]),
  });
  auditUploadFormSubscription: Subscription;

  constructor(
    private appService: PlaygroundService,
    private router: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.updateProgress();
    this.fetchProjects();
    window.OpAuthHelper?.onLogin(() => {
      this.router.queryParams
        .pipe(takeUntil(this.destroySub))
        .subscribe((params) => {
          const siteUrl = params.siteUrl as string;
          const preset = params.preset;
          if (siteUrl && preset) {
            this.sites = siteUrl;
            this.selectedPreset = preset;
            this.auditWebsite();
          }
        });
    });

    this.auditUploadForm
      .get('project')
      .valueChanges.pipe(takeUntil(this.destroySub))
      .subscribe((selectedProject: string) => {
        this.fetchProjectBranches(selectedProject);
      });
  }

  ngOnDestroy(): void {
    this.destroySub.next(true);
    this.destroySub.unsubscribe();
  }

  get user(): any {
    return window?.OpAuthHelper?.getUserInfo();
  }

  scrollBottom = (): void => {
    document
      .querySelector('#codeBlock')
      .scrollTo(0, document.querySelector('#codeBlock').scrollHeight);
  };

  whitespaceValidator(control: FormControl) {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { whitespace: true };
  }

  verifyProject = async (buildToken: string, projectId: string) => {
    const res = await this.appService.verifyLHProjectDetails(
      environment.LH_SERVER_URL,
      buildToken
    );
    if (res.verifyLHProjectDetails?.id !== projectId) {
      throw Error('Invalid token');
    }
  };

  updateProgress = (): void => {
    this.appService
      .autorun()
      .pipe(takeUntil(this.destroySub))
      .subscribe((progress: string) => {
        if (progress.substr(0, this.auditId.length) === this.auditId) {
          if (progress.replace(this.auditId, '')) {
            progress = progress.replace(this.auditId, '');
            if (progress !== `1`) {
              progress = this.linkParser(progress);
              this.auditProgress += this.convert.toHtml(progress);
            } else {
              this.loading = false;
              window.OpNotification.success({
                subject: `Audit completed successfully`,
              });
              this.fetchScore(this.auditId);
            }
            this.scrollBottom();
          }
        }
      });
  };

  linkParser = (progress) => {
    const replacePattern1 =
      /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gi;
    const replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    let replacedText = progress.replace(
      replacePattern1,
      '<a href="$1" target="_blank">$1</a>'
    );
    replacedText = replacedText.replace(
      replacePattern2,
      '$1<a href="http://$2" target="_blank">$2</a>'
    );
    return replacedText;
  };

  auditWebsite = (): void => {
    this.auditProgress = ``;
    this.loading = true;
    this.showScore = false;
    const property = {
      sites: this.sites,
      preset: this.selectedPreset,
    };
    this.appService
      .auditWebsite(property)
      .pipe(takeUntil(this.destroySub))
      .subscribe((response) => {
        this.auditId = response.auditWebsite;
        window.OpNotification.success({
          subject: `Audit started successfully`,
        });
      });
  };

  fetchScore = (auditId): void => {
    this.appService.fetchScore(auditId).then((responses) => {
      this.showScore = true;
      const scores = responses.reduce((acc, val) => {
        Object.keys(val).map((prop: any) => {
          if (prop in acc) {
            acc[prop] += val[prop];
          } else {
            acc[prop] = val[prop];
          }
        });
        return acc;
      }, {});

      this.lhciScores.map((record) => {
        Object.keys(scores).map((key) => {
          if (key === record.label) {
            record.score = Math.trunc((scores[key] / responses.length) * 100);
            if (record.score >= 0 && record.score <= 49) {
              record.class = 'orange';
            } else if (record.score >= 50 && record.score <= 89) {
              record.class = 'blue';
            } else if (record.score >= 90 && record.score <= 100) {
              record.class = 'green';
            }
            return record;
          }
        });
      });
    });
  };

  fetchProjects = (): void => {
    this.isFetchingProjects = true;
    this.appService
      .fetchProjects()
      .then((responses) => {
        this.projects = responses.listLHProjects.rows;
      })
      .finally(() => (this.isFetchingProjects = false));
  };

  fetchProjectBranches = (projectId: string): void => {
    if (projectId) {
      this.isFetchingBranches = true;
      this.appService
        .fetchProjectBranches(projectId)
        .then((responses) => {
          this.projectBranches = responses.listLHProjectBranches.rows;
        })
        .finally(() => (this.isFetchingBranches = false));
    }
  };

  upload = async (): Promise<void> => {
    const { project, branch, buildToken } = this.auditUploadForm.value;

    if (!this.auditId) {
      window.OpNotification.danger({
        subject: 'Uploading report failed!!',
        body: 'Execute an audit',
      });
      return;
    }

    try {
      await this.verifyProject(buildToken, project);

      const uploadProperty = {
        auditId: this.auditId,
        serverBaseUrl: environment.LH_SERVER_URL,
        authorName: this.user.fullName,
        authorEmail: this.user.email,
        currentBranch: branch,
        buildToken,
        preset: this.selectedPreset,
        sites: this.sites,
      };

      this.appService
        .upload(uploadProperty)
        .pipe(takeUntil(this.destroySub))
        .subscribe((response) => {
          if (response.upload) {
            this.toggleModal = false;
            window.OpNotification.success({
              subject: `Started upload of LHR Report`,
              body: `LHR Upload to ${environment.LH_SERVER_URL} in progress.`,
            });
          }
        });
    } catch (error) {
      window.OpNotification.danger({
        subject: 'Uploading report failed!!',
        body: error.message,
      });
    }
  };
}
