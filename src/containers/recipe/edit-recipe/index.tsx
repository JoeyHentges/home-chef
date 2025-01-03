"use client"

import { useEffect, useRef, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { CookingPotIcon, MoveLeftIcon } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { FormattedRecipeDetails, RecipeDetails } from "@/types/Recipe"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { MultipleSelector } from "@/components/multiple-selector"

import { EditDirections } from "./edit-directions"
import { EditIngredients } from "./edit-ingredients"

interface EditRecipeProps {
  newRecipe?: boolean
  startRecipe: FormattedRecipeDetails
  availableTags: { name: string }[]
  onDisableEditView?: () => void
}

const editRecipeFormSchema = z.object({
  recipe: z.object({
    title: z.string().min(2),
    description: z.string(),
    servings: z.string().min(1),
    prepTime: z.number().min(0),
    cookTime: z.number().min(0),
    difficulty: z
      .enum(["beginner", "intermediate", "advanced"])
      .nullable()
      .optional(),
    private: z.boolean().default(false),
  }),
  ingredients: z.array(
    z.object({
      orderNumber: z.number(),
      description: z.string().min(3),
    })
  ),
  directions: z.array(
    z.object({
      orderNumber: z.number(),
      description: z.string().min(3),
    })
  ),
  tags: z.array(
    z.object({
      value: z.string(),
      label: z.string(),
    })
  ),
})

export function EditRecipe(props: EditRecipeProps) {
  const {
    newRecipe = false,
    startRecipe,
    availableTags,
    onDisableEditView,
  } = props

  const form = useForm<z.infer<typeof editRecipeFormSchema>>({
    resolver: zodResolver(editRecipeFormSchema),
    defaultValues: {
      ...startRecipe,
      recipe: {
        ...startRecipe.recipe,
        description: startRecipe.recipe.description ?? "",
        prepTime: startRecipe.recipe.prepTime ?? 0,
      },
      tags:
        startRecipe.tags?.map((tag) => ({
          value: tag,
          label: tag,
        })) ?? [],
    },
  })

  function onBackButtonClicked() {
    form.reset()
    if (onDisableEditView) {
      onDisableEditView()
    }
  }

  // on save - create new recipe (all imorted recipes are their own) & redirect to recipe page for newly create recipe
  // NOTE saved recipe and imported recipe cannot be the same - must have at least 1 difference (even 1 character)
  function onSubmit(values: z.infer<typeof editRecipeFormSchema>) {
    console.log(values)
    //execute(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="container flex max-w-[1000px] flex-row items-center justify-between">
          <div className="flex flex-row items-center gap-x-4">
            {onDisableEditView && (
              <button
                onClick={onBackButtonClicked}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <MoveLeftIcon />
              </button>
            )}
            <p className="text-xl">{newRecipe ? "New" : "Edit"} recipe</p>
          </div>

          <Button type="submit">Save recipe</Button>
        </div>

        <div className="container max-w-[1000px] space-y-6 rounded-3xl bg-primary/20 p-4 md:p-8">
          <div className="flex flex-col items-center gap-x-6 gap-y-4 md:flex-row md:items-start">
            <div className="center relative h-[250px] w-[350px] max-w-full rounded-2xl bg-primary/20 md:h-[125px] md:w-[175px] md:rounded-l-3xl">
              <CookingPotIcon className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 transform text-muted-foreground" />
            </div>

            <div className="flex h-full w-full flex-col justify-between space-y-2 md:space-y-8">
              <FormField
                control={form.control}
                name="recipe.title"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Recipe name"
                        type="text"
                        className="h-12 md:text-2xl"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col items-center gap-x-2 gap-y-2 md:flex-row">
                <FormField
                  control={form.control}
                  name="recipe.servings"
                  render={({ field }) => (
                    <FormItem className="w-full md:w-[200px]">
                      <FormControl>
                        <Input {...field} placeholder="Servings" type="text" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex flex-row items-center gap-x-2">
                  <FormField
                    control={form.control}
                    name="recipe.prepTime"
                    render={({ field }) => (
                      <FormItem className="w-[125px]">
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Prep time"
                              type="number"
                            />
                            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                              min
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="recipe.cookTime"
                    render={({ field }) => (
                      <FormItem className="w-[125px]">
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="Cook time"
                              type="number"
                            />
                            <span className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-3 text-sm text-muted-foreground peer-disabled:opacity-50">
                              min
                            </span>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </div>

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <MultipleSelector
                    className="bg-background hover:bg-background"
                    options={availableTags.map((tag) => ({
                      value: tag.name,
                      label: tag.name,
                    }))}
                    onChange={field.onChange}
                    value={field.value}
                    placeholder="Select tags"
                    maxSelected={10}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="recipe.description"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Recipe description" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex flex-col gap-x-10 gap-y-12 md:flex-row md:items-start">
            <div className="select-none md:w-3/4">
              <p className="pb-3 text-2xl font-bold">Ingredients</p>
              <FormField
                control={form.control}
                name="ingredients"
                render={({ field }) => (
                  <FormItem>
                    {form.formState.errors.ingredients && (
                      <p className="text-sm text-destructive">
                        Ingredients must be at least 3 characters
                      </p>
                    )}
                    <FormControl>
                      <EditIngredients
                        ingredients={field.value}
                        setIngredients={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="w-full select-none">
              <p className="pb-3 text-2xl font-bold">Directions</p>
              <FormField
                control={form.control}
                name="directions"
                render={({ field }) => (
                  <FormItem>
                    {form.formState.errors.ingredients && (
                      <p className="text-sm text-destructive">
                        Directions must be at least 3 characters
                      </p>
                    )}
                    <FormControl>
                      <EditDirections
                        directions={field.value}
                        setDirections={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
      </form>
    </Form>
  )
}
