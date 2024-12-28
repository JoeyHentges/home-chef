import { eq } from "drizzle-orm"

import { PrimaryKey } from "@/types"
import { database } from "@/db"
import { RecipeTag, recipeTags, tags } from "@/db/schemas"

export async function getRecipeTag(
  recipeTagId: PrimaryKey
): Promise<RecipeTag | undefined> {
  const recipeTag = await database.query.recipeTags.findFirst({
    where: eq(recipeTags.id, recipeTagId),
  })

  return recipeTag
}

export async function getRecipeTagsByRecipeId(recipeId: PrimaryKey): Promise<
  | {
      id: number
      dateCreated: Date
      dateUpdated: Date
      name: string
    }[]
  | undefined
> {
  const recipeIngredientsList = await database
    .select({
      id: recipeTags.id,
      dateCreated: recipeTags.dateCreated,
      dateUpdated: recipeTags.dateUpdated,
      name: tags.name,
    })
    .from(recipeTags)
    .where(eq(recipeTags.recipeId, recipeId))
    .innerJoin(tags, eq(recipeTags.tagId, tags.id))

  return recipeIngredientsList
}