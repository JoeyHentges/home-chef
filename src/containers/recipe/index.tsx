"use client"

import { useState } from "react"

import { FormattedRecipeDetails } from "@/types/Recipe"
import { User } from "@/db/schemas"

import { EditRecipe } from "./edit-recipe"
import { ViewRecipe } from "./view-recipe"

interface RecipeContainerProps {
  user?: User
  recipe?: FormattedRecipeDetails
  availableTags: { name: string }[]
}

export function RecipeContainer(props: RecipeContainerProps) {
  const { user, recipe, availableTags } = props

  const [enableEditView, setEnableEditView] = useState<boolean>(false)

  // no recipe -> new recipe - edit recipe with blank details
  if (!recipe) {
    return (
      <EditRecipe
        newRecipe
        startRecipe={{
          recipe: {
            title: "",
            description: null,
            prepTime: 0,
            cookTime: 0,
            difficulty: null,
            servings: "",
            private: false,
          },
          author: user,
          ingredients: [],
          directions: [],
          tags: [],
        }}
        availableTags={availableTags}
      />
    )
  }

  if (enableEditView) {
    return (
      <EditRecipe
        startRecipe={recipe}
        availableTags={availableTags}
        onDisableEditView={() => setEnableEditView(false)}
      />
    )
  }

  return (
    <ViewRecipe
      user={user}
      recipe={recipe}
      onEditRecipeClicked={() => setEnableEditView(true)}
    />
  )
}
