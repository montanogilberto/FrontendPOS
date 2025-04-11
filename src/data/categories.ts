//export const categories = [
    //{ id: 'percherones', name: 'Percherones', image: '/assets/burros.jpg' },
    //{ id: 'kesadillas', name: 'Kesadillas', image: '/assets/quesadilles-de-pollastre-ametlle.webp' },
    //{ id: 'tacos', name: 'Tacos', image: '/assets/Tacos-Adobada.webp' },
    //{ id: 'boneless', name: 'Boneless', image: '/assets/Boneless.jpg' },
    //{ id: 'entradas', name: 'Entradas', image: '/assets/Cono_papa.png' },
    //{ id: 'bebidas', name: 'Bebidas', image: '/assets/te-arizona.webp' }
  //];

  export interface Categories {
    productCategoryId: number;
    name: string;
    image: string;
  }

  export async function fetchCategories(): Promise<Categories[]> {
    try {
      const response = await fetch("https://smartloansbackend.azurewebsites.net/food_categories_products");
      const data = await response.json();
      
      // Directly return the categories array from the response
      if (!Array.isArray(data)) {
        console.error('Unexpected response format:', data);
        return [];
      }
      
      return data; // Return the categories array directly
    } catch (error) {
      console.error('Error fetching products categories:', error);
      return [];  // Return empty array if the fetch fails
    }
  }
  