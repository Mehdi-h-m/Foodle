import requests

def get_meal_categories():
    url = "https://www.themealdb.com/api/json/v1/1/list.php?c=list"
    response = requests.get(url)

    if response.status_code == 200:
        data = response.json()
        categories = data.get("meals", [])
        print("Meal Categories:")
        for item in categories:
            print("-", item["strCategory"])
    else:
        print("Failed to retrieve data. Status code:", response.status_code)

if __name__ == "__main__":
    get_meal_categories()
