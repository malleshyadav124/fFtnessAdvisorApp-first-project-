const pool = require('../db');

class NutritionService {
  async searchFood(query) {
    try {
      const result = await pool.query(
        `SELECT * FROM food_database 
        WHERE LOWER(name) LIKE LOWER($1) 
        OR LOWER(category) LIKE LOWER($1)
        LIMIT 10`,
        [`%${query}%`]
      );
      return result.rows;
    } catch (error) {
      console.error('Error searching food:', error);
      throw error;
    }
  }

  async getFoodDetails(id) {
    try {
      const result = await pool.query(
        'SELECT * FROM food_database WHERE id = $1',
        [id]
      );
      return result.rows[0];
    } catch (error) {
      console.error('Error getting food details:', error);
      throw error;
    }
  }

  async calculateNutrition(query) {
    try {
      // Search for the food in our database
      const foods = await this.searchFood(query);
      
      if (foods.length === 0) {
        return {
          error: 'Food not found in database',
          suggestions: await this.getFoodSuggestions()
        };
      }

      // Return the first matching food's nutrition info
      return {
        name: foods[0].name,
        calories: foods[0].calories,
        protein: foods[0].protein,
        carbs: foods[0].carbs,
        fat: foods[0].fat,
        serving_size: foods[0].serving_size,
        serving_unit: foods[0].serving_unit
      };
    } catch (error) {
      console.error('Error calculating nutrition:', error);
      throw error;
    }
  }

  async getFoodSuggestions() {
    try {
      const result = await pool.query(
        'SELECT name, category FROM food_database ORDER BY RANDOM() LIMIT 5'
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting food suggestions:', error);
      throw error;
    }
  }
}

module.exports = new NutritionService(); 