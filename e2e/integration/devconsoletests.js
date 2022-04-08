/// <reference types="Cypress" />
context( 'Test developer console', () => {
    before( () => {
        cy.viewport(Cypress.env('width'), Cypress.env('height') );
        cy.visit( Cypress.env( 'QA_HOST' ) +'console');
        cy.login( Cypress.env( 'USERNAME' ), Cypress.env( 'PASSWORD' ) );
    } );


    it( 'Check whether the app is already existing', () => {
        cy.wait( 10000 )
        cy.get( 'h2' ).each( ( elem, index ) => {
            var heading = elem.text()
            cy.log( heading )
            if ( heading == 'e2e test automation' )  {
                cy.xpath( '//a//h2[text()="e2e test automation"]/ancestor::section/following-sibling::aside/descendant::button' ).click( { force: true } )
                cy.contains( 'Delete' ).click( { force: true } )
                  cy.get( '#delete-app').type( 'e2e test automation' );
        cy.contains( 'I understand the consequences, delete this app' ).click();
        cy.contains( 'App Deleted Successfully!' ).should( 'be.visible' );

            }
        })

    } )
    it( 'Check the count of apps existing on the dev console main page', () => {
        cy.get( 'article' ).its('length').as( 'countofapps' );
    } )
    it( 'Test for create the application', () => {
        cy.contains( 'Create new App').click();
        cy.get( '#app-name' ).type( 'e2e test automation' );
        cy.get( '#app-desc' ).type( 'e2e test automation' );
        cy.contains( 'Create App' ).click();
        cy.contains( 'App Created Successfully!').should( 'be.visible' );
    } );
    it( 'Verifying the count of apps displayed in dropdown',function () {
        cy.get( 'button[aria-label^="Options"]' ).click( { force: true } )
        cy.get( 'ul[role*="menu"] > li' ).then( ( elem ) => {
            var len = elem.length
            expect( len ).to.be.eq( this.countofapps );
        } )
        cy.get( 'button[aria-label^="Options"]' ).click( { force: true } )
        cy.wait(1000)
    })
    it( 'Get Count of Integrations', () => {

        cy.get(".pf-l-grid__item.pf-m-3-col.pf-m-2-col-on-xl nav ul li").its('length').as('lengthofintegration')
    } )
    it( 'Verify the integrations count same as Rows in Table of Overview', function () {
        cy.get( "article button span[class='pf-c-menu__item-text']" ).then( ( elem ) => {
            var lengthoftable = elem.length;
            expect(lengthoftable).to.be.eq(this.lengthofintegration-3)
        })
    } )
    it( 'Check OP Navbar Link and count of steps should be 5', () => {
        cy.get( '.app-details--sidebar--main-nav' ).within( () => {
            cy.contains('OP Navbar').should('be.visible').click({force:true});
        } )
        cy.get('code').should('have.length',5)
    } )

    it( 'Check Database link', () => {
          cy.get( '.app-details--sidebar--main-nav' ).within( () => {
            cy.contains('Database').click({force:true});
          } )

    } )
    it( 'Check Lighthouse config options page visiblity', () => {
        cy.get( '.app-details--sidebar--main-nav' ).within( () => {
            cy.contains( 'Lighthouse' ).should( 'be.visible' ).click( { force: true } );
        })
         cy.contains( 'Configure Lighthouse' ).should( 'be.visible' )
        cy.get( '.pf-c-empty-state__body' ).within( () => {
            cy.get( 'img' ).should( 'be.visible' );
        })
            cy.contains( 'Learn more' ).should( 'be.visible' )
        cy.contains( 'Get Started' ).should( 'be.visible' ).click( { force: true } );
        })
    it( 'Link App To Lighthouse is visible',()=> {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.contains( 'Link the app to a Lighthouse CI Project' ).should( 'be.visible' );
    })
    } )
    it( 'New Project and link to existing project tab visibility test', () => {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.contains( 'New Project' ).should( 'be.visible' );
            cy.contains( 'Link to existing Project' ).should( 'be.visible' );
        } );
    } )
    it( 'Enter info into Lighthouse info', () => {

        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.faker = require('faker');
            const words = cy.faker.lorem.words();
            cy.get('input[name="projectName"]').type(words, { force: true });
            cy.get( 'input[name="projectName"]' ).invoke( 'val' ).as( 'projName' );
            cy.get( 'input[name="repoUrl"]' ).type( 'https://github.com/1-Platform/one-platform' );
            cy.get( 'input[name="baseBranch"]' ).type( "test" )
            cy.xpath( '//button[normalize-space()="Create Project"]' ).should( 'be.visible' ).click( { force: true } );
        } );
    } )
    it( 'Lighthouse Config Second Step Opened', function() {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.contains( 'New Project '+this.projName+' has been created' ).should( 'be.visible' );

        } );
    })
        it( 'Build and Admin Token Generated', () => {
            cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
                cy.contains( 'Build Token(Used to connect and upload reports)' ).should( 'be.visible' );
                cy.contains( 'Admin Token(Used to manage the Project)' ).should( 'be.visible' );
                cy.get( 'div > input[aria-label="Copyable input"]' ).should( 'not.have.value','' );
            } );
        } )
        it( 'Copy Buttons are visible', () => {
            cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
                cy.get( 'button[aria-label^="Copy to clipboard"]' ).should( 'be.visible' ).should('have.length',2);
            } );
        } )
     it( 'Copy Buttons are clickable', () => {
            cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
                cy.get( 'button[aria-label^="Copy to clipboard"]' ).should( 'be.visible' ).click({multiple:true},{force:true})
            } );
        } )
    it( 'Branch Mandatory Validation Message Check', () => {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.contains( 'Link Project' ).should( 'be.visible' ).click( { force: true } );
            cy.contains( 'Branch is mandatory field' ).should( 'be.visible' );
        } );
    })
        it( 'Select Branch and click on Link Project', () => {
            cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
                cy.get( 'input[placeholder*="Select a branch"]' ).type( 'test' ).then( () => {
                    cy.get( '.pf-c-select__menu-item' ).click( { force: true } );
                    cy.wait( 2000 );
                });
                cy.contains( 'Link Project' ).click( { force: true } );
            } );
        } )
    it( 'Test for SPA Configured successful message', () => {
        cy.contains( 'SPA configuration saved successfully!' ).should( 'be.visible' );
    } )
    it( 'Configure Lighthouse Heading Visibility', () => {
        cy.contains( 'Configure Lighthouse' ).should( 'be.visible' );
        cy.contains( 'You are all set!' ).should( 'be.visible' );
    } )
    it( 'Code section visiblity test', () => {
        cy.xpath('//pre[contains(text(),"module.exports = {")]').should('be.visible')
    } )
    it( 'Hide Code On Button click test', () => {
        cy.get( '.pf-c-button.pf-m-control:nth-child(1)' ).click( { force: true } );
    })
    it( 'Test Copy Icon click of Configure lighthouse', () => {
         cy.get( '.pf-c-button.pf-m-control:nth-child(3)' ).should( 'be.visible' ).click({force:true})
    })
    it( 'Check Link Redirections', () => {
        cy.contains( 'Learn More' ).should( 'have.attr', 'href', 'https://qa.one.redhat.com/get-started/docs/apps/internal/lighthouse' );
        cy.contains( 'View my Lighthouse reports' ).should( 'have.attr', 'href', 'https://qa.one.redhat.com/lighthouse' );
        cy.contains( 'docs' ).should( 'have.attr', 'href', 'https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md' );

    } )
    it( 'Manage Lighthouse config button visibility and click', () => {
        cy.contains( 'Manage Lighthouse Config' ).click( { force: true } );

    } )
    it( 'Check whether config page with link to existing project tab opens', () => {
        cy.xpath( '//form[@class="pf-c-form"]//span[@class="pf-c-form__label-text"]' ).contains( 'Project Name' ).should( 'be.visible' );
        } );
    it( 'Check if project name is visible and do valid search', function () {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.get( '.pf-c-context-selector__toggle' ).should( 'have.text', this.projName );
            cy.get( '.pf-c-context-selector__toggle' ).click( { force: true } ).then( () => {
                cy.get( 'input[placeholder="Search"]' ).type( this.projName );
                cy.xpath( '//button[@id="pf-context-selector-search-button-id-0"]' ).click( { force: true } );
                cy.get( 'li[role="none"] button' ).should( 'have.text', this.projName ).click({force:true});
            } );
        })
    })
    it( 'Test Delete of lighthouse project', () => {
        cy.get( '.pf-c-modal-box.pf-m-sm' ).within( () => {
            cy.contains( 'Delete' ).should( 'be.visible' ).click( { force: true } );
        } );
    })
    it( 'Check for Delete notification', () => {
        cy.contains( 'SPA configuration deleted successfully!' ).should( 'be.visible' );
    } );
    it( 'Check whether at config home page', () => {
         cy.contains( 'Configure Lighthouse' ).should( 'be.visible' )
        cy.get( '.pf-c-empty-state__body' ).within( () => {
            cy.get( 'img' ).should( 'be.visible' );
        })
            cy.contains( 'Learn more' ).should( 'be.visible' )
        cy.contains( 'Get Started' ).should( 'be.visible' ).click( { force: true } );
        })


    it( 'Test for header section of feedback page', () => {
        cy.get( '.app-details--sidebar--main-nav' ).within( () => {
            cy.contains('Feedback').click({force:true});
        } )

    } );

    it( 'Test for feedback target header', () => {
               cy.get( 'h3').should( 'contain.text', 'User Feedback')
        } )

it( 'Click on Edit Feedback', () => {
    cy.xpath( "//button[normalize-space()='Edit Feedback Config']" ).click();
    })

    it( 'Test for feedback target help circle', () => {
        cy.get('[name=help-circle-outline]').click()
        cy.contains( 'The target where the feeback should be submitted as an issue or a ticket.' ).should('be.visible')
    } )

    it( 'Test for selecting feedback target and save it', () => {
        cy.get( '.pf-c-form' ).within( () => {
            cy.contains( 'JIRA' ).click()
            cy.get( '#projectKey' ).type( 'Test' )
            cy.get( '#feedbackEmail' ).type( 'test@redhat.com' )
            cy.get( '[aria-disabled="true"]' ).should( 'be.visible' );
            cy.contains( 'Save' ).click()
        } )
    })

    it( 'Test for update the application', () => {
        cy.wait(3000)
        cy.contains( 'App Settings').click({force:true});
        cy.wait(3000)
        cy.get( '#name').clear().type( 'e2e test automation update' );
        cy.contains( 'Save' ).click();
        cy.wait( 3000 )
        cy.contains( 'App Updated Successfully!' ).should( 'be.visible' );
    } );

    it( 'Test for delete the application', () => {
        cy.contains( 'Delete this App' ).click({force:true});
        cy.get( '#delete-app').type( 'e2e test automation update' );
        cy.contains( 'I understand the consequences, delete this app' ).click();
        cy.contains( 'App Deleted Successfully!' ).should( 'be.visible' );
    } );
} )
