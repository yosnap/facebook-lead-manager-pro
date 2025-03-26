interface SearchState {
  isSearching: boolean;
  isPaused: boolean;
  searchTerm: string;
  searchType: 'people' | 'pages' | 'groups';
  city?: string;
  scrollCount: number;
}

interface Profile {
  name: string;
  profileUrl: string;
  type: 'people' | 'pages' | 'groups';
}

class FacebookProfileScraper {
  private state: SearchState = {
    isSearching: false,
    isPaused: false,
    searchTerm: '',
    searchType: 'people',
    scrollCount: 0,
  };

  private scrollInterval: NodeJS.Timeout | null = null;
  private processedUrls: Set<string> = new Set();

  constructor() {
    console.log('FacebookProfileScraper initialized');
    this.initMessageListener();
  }

  private initMessageListener(): void {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Message received:', message);
      switch (message.action) {
        case 'START_SEARCH':
          console.log('Starting search with:', message.data);
          this.startSearch(message.data.searchTerm, message.data.searchType, message.data.city);
          sendResponse({ status: 'ok' });
          break;
        case 'STOP_SEARCH':
          this.stopSearch();
          sendResponse({ status: 'ok' });
          break;
        case 'PAUSE_SEARCH':
          this.pauseSearch();
          sendResponse({ status: 'ok' });
          break;
        case 'RESUME_SEARCH':
          this.resumeSearch();
          sendResponse({ status: 'ok' });
          break;
      }
      return true;
    });
  }

  private async startSearch(
    searchTerm: string, 
    searchType: 'people' | 'pages' | 'groups', 
    city?: string
  ): Promise<void> {
    console.log('Starting search process...', { searchTerm, searchType, city });
    this.state = {
      isSearching: true,
      isPaused: false,
      searchTerm,
      searchType,
      city,
      scrollCount: 0,
    };

    try {
      await this.navigateToSearch();
    } catch (error) {
      console.error('Error in search process:', error);
    }
  }

  private async navigateToSearch(): Promise<void> {
    console.log('Navigating to search...');
    try {
      // Construir la URL de búsqueda
      const searchUrl = this.buildSearchUrl();
      console.log('Search URL:', searchUrl);
      
      // Navegar directamente a la URL de búsqueda
      window.location.href = searchUrl;
      
      // Esperar a que la página cargue
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Iniciar el proceso de scrolling
      this.startScrolling();
    } catch (error) {
      console.error('Error in navigateToSearch:', error);
    }
  }

  private buildSearchUrl(): string {
    const baseUrl = 'https://www.facebook.com/search/';
    const encodedTerm = encodeURIComponent(this.state.searchTerm);
    
    let searchUrl = '';
    switch (this.state.searchType) {
      case 'people':
        searchUrl = `${baseUrl}people/?q=${encodedTerm}`;
        break;
      case 'pages':
        searchUrl = `${baseUrl}pages/?q=${encodedTerm}`;
        break;
      case 'groups':
        searchUrl = `${baseUrl}groups/?q=${encodedTerm}`;
        break;
    }

    if (this.state.city) {
      searchUrl += `&filters={"city":"${encodeURIComponent(this.state.city)}"}`;
    }

    return searchUrl;
  }

  private processVisibleProfiles(): void {
    console.log('Processing visible items...');
    
    let containers: NodeListOf<Element>;
    let selector: string;
    
    switch (this.state.searchType) {
      case 'people':
        selector = 'div[role="article"]';
        break;
      case 'pages':
        selector = 'div[role="article"], div[data-type="result"]';
        break;
      case 'groups':
        selector = 'div[role="article"], div[data-testid="group-card"]';
        break;
      default:
        selector = 'div[role="article"]';
    }
    
    containers = document.querySelectorAll(selector);
    console.log(`Found ${containers.length} ${this.state.searchType} containers`);
    
    containers.forEach((container) => {
      try {
        let link: Element | null;
        let name: string;
        
        switch (this.state.searchType) {
          case 'people':
            link = container.querySelector('a[href*="/profile/"], a[href*="/people/"], a[href*="/user/"], a[href*="/profile.php"]');
            break;
          case 'pages':
            link = container.querySelector('a[href*="/pages/"], a[href*="/page/"]');
            break;
          case 'groups':
            link = container.querySelector('a[href*="/groups/"]');
            break;
          default:
            link = null;
        }
        
        if (link) {
          const url = link.getAttribute('href');
          
          if (url && !this.processedUrls.has(url)) {
            const nameElement = link.querySelector('span') || link;
            name = nameElement.textContent?.trim() || 'Sin nombre';
            
            const fullUrl = url.startsWith('http') ? url : `https://www.facebook.com${url}`;
            
            console.log(`${this.state.searchType} found:`, { name, url: fullUrl });
            
            this.processedUrls.add(url);
            chrome.runtime.sendMessage({
              action: 'PROFILE_FOUND',
              data: {
                name,
                profileUrl: fullUrl,
                type: this.state.searchType
              }
            });
          }
        }
      } catch (error) {
        console.error('Error processing item:', error);
      }
    });
  }

  private startScrolling(): void {
    console.log('Starting scroll process...');
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
    }

    let lastHeight = document.body.scrollHeight;
    let noNewContentCount = 0;

    this.scrollInterval = setInterval(() => {
      if (!this.state.isPaused && this.state.isSearching) {
        // Hacer scroll
        window.scrollBy(0, 300);
        this.state.scrollCount++;
        
        // Procesar perfiles visibles
        this.processVisibleProfiles();
        
        // Verificar si hay nuevo contenido
        const currentHeight = document.body.scrollHeight;
        if (currentHeight === lastHeight) {
          noNewContentCount++;
          if (noNewContentCount >= 5) {
            // Si no hay nuevo contenido después de 5 intentos, esperar más tiempo
            console.log('No new content found, waiting longer...');
            noNewContentCount = 0;
            return;
          }
        } else {
          noNewContentCount = 0;
          lastHeight = currentHeight;
        }
      }
    }, 2000);
  }

  private stopSearch(): void {
    console.log('Stopping search...');
    this.state.isSearching = false;
    if (this.scrollInterval) {
      clearInterval(this.scrollInterval);
      this.scrollInterval = null;
    }
    this.processedUrls.clear();
  }

  private pauseSearch(): void {
    console.log('Pausing search...');
    this.state.isPaused = true;
  }

  private resumeSearch(): void {
    console.log('Resuming search...');
    this.state.isPaused = false;
  }
}

// Inicializar el scraper
console.log('Content script loaded and running');
new FacebookProfileScraper();