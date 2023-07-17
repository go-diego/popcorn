/**
 * Cypress hates it when I import this????
 */
// import {POPULAR_MOVIES_BASE_URL_STRING} from '../../src/lib/tmdb'

const MOCK_MOVIE = {
  adult: false,
  backdrop_path: '/qWQSnedj0LCUjWNp9fLcMtfgadp.jpg',
  genre_ids: [28, 12, 878],
  id: 667538,
  original_language: 'en',
  original_title: 'NOT The Transformers Movie',
  overview:
    'When a new threat capable of destroying the entire planet emerges, Optimus Prime and the Autobots must team up with a powerful faction known as the Maximals. With the fate of humanity hanging in the balance, humans Noah and Elena will do whatever it takes to help the Transformers as they engage in the ultimate battle to save Earth.',
  popularity: 10601.844,
  poster_path: '/gPbM0MK8CP8A174rmUwGsADNYKD.jpg',
  release_date: '2023-06-06',
  title: 'NOT The Transformers Movie',
  video: false,
  vote_average: 7.3,
  vote_count: 1215,
}

describe('As a user, I want to view a list of popular movies when I open the app', () => {
  beforeEach(() => {
    cy.intercept('GET', `**/discover/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [],
      },
    }).as('getPopularMovies')
  })

  it('should display a list of popular movies', () => {
    cy.intercept('GET', `**/discover/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [MOCK_MOVIE, MOCK_MOVIE],
      },
    }).as('getPopularMovies')
    cy.visit('/')
    cy.get('.movie-card').should('exist').and('have.length', 2)
  })

  it("should display empty state when there's no popular movies", () => {
    cy.intercept('GET', `**/discover/movie?*`, {
      body: {
        page: 1,
        total_pages: 0,
        total_results: 0,
        results: [],
      },
    }).as('getPopularMovies')
    cy.visit('/')
    cy.findByTestId('no-movies').should('exist')
  })

  it('should display error state', () => {
    cy.intercept('GET', `**/discover/movie?*`, {
      statusCode: 500,
      body: {
        page: 1,
        total_pages: 0,
        total_results: 0,
        results: [],
      },
    }).as('getPopularMovies')
    cy.visit('/')
    cy.findByTestId('popular-movies-error').should('exist')
  })

  it("should navigate to movie's detail page when a movie is clicked", () => {
    cy.intercept('GET', `**/discover/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [MOCK_MOVIE, MOCK_MOVIE],
      },
    }).as('getPopularMovies')
    cy.visit('/')
    cy.get('.movie-card').first().click()
    cy.url().should('include', `/movie/${MOCK_MOVIE.id}`)
  })
})

function openSearchDialog() {
  cy.findByTestId('search-movies-button').click()
  cy.findByRole('dialog').should('be.visible')
}

describe('As a user, I want to search for a movie by its title', () => {
  beforeEach(() => {
    cy.intercept('GET', `**/discover/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [],
      },
    }).as('getPopularMovies')
  })

  it('should display results of search', () => {
    cy.intercept('GET', `**/search/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [MOCK_MOVIE, MOCK_MOVIE, MOCK_MOVIE],
      },
    }).as('searchMovies')
    cy.visit('/')
    openSearchDialog()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox').type('Transformers')
    })

    cy.findByTestId('search-results-list').get('li').should('have.length', 3)
  })

  it('should display empty state if no results are returned', () => {
    cy.intercept('GET', `**/search/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [],
      },
    }).as('searchMovies')
    cy.visit('/')
    openSearchDialog()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox').type('Transformers')
    })

    cy.wait('@searchMovies')

    cy.findByTestId('search-results-list').should('not.exist')
    cy.findByTestId('no-search-results').should('exist')
  })

  it('should display error state if there is an error', () => {
    cy.intercept('GET', `**/search/movie?*`, {
      statusCode: 500,
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [],
      },
    }).as('searchMovies')
    cy.visit('/')
    openSearchDialog()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox').type('Transformers')
    })

    cy.wait('@searchMovies')

    cy.findByTestId('search-results-list').should('not.exist')
    cy.findByTestId('search-movies-error').should('exist')
  })

  it("should navigate to movie's details page when clicked", () => {
    cy.intercept('GET', `**/search/movie?*`, {
      body: {
        page: 1,
        total_pages: 500,
        total_results: 10000,
        results: [MOCK_MOVIE, MOCK_MOVIE, MOCK_MOVIE],
      },
    }).as('searchMovies')
    cy.visit('/')
    openSearchDialog()

    cy.findByRole('dialog').within(() => {
      cy.findByRole('textbox').type('Transformers')
    })

    cy.findByTestId('search-results-list').get('li').first().click()

    cy.url().should('include', `/movie/${MOCK_MOVIE.id}`)
  })
})
