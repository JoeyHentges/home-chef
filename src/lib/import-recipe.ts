/* eslint-disable */

import * as cheerio from "cheerio"

async function fetchPageHtml(url: string) {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText}`)
  }
  return response.text()
}

function tryMetadata(jsonString: string) {
  const structuredData = JSON.parse(jsonString)

  if (Array.isArray(structuredData)) {
    const recipeData = structuredData.find((item) => item["@type"] === "Recipe")
    if (recipeData) {
      return recipeData
    }

    // Could be www.allrecipes.com - they handle schema differently
    if (structuredData.length === 1) {
      return structuredData[0]
    }
  }

  if (structuredData["@graph"] && Array.isArray(structuredData["@graph"])) {
    const recipeData = structuredData["@graph"].find(
      (item) => item["@type"] === "Recipe"
    )
    if (recipeData) {
      return recipeData
    }
  }

  if (structuredData["@type"] === "Recipe") {
    return structuredData
  }

  return undefined
}

function tryHtmlSelectors($: cheerio.CheerioAPI) {
  const title = $("h1").text().trim() || $("title").text().trim()
  const servings = $(".servings").text().trim()
  const cookTime = $(".cook-time").text().trim()
  const ingredients = $(".ingredients li")
    .map((_, el) => $(el).text().trim())
    .get()
  const directions = $(".instructions p, .directions p")
    .map((_, el) => $(el).text().trim())
    .get()

  return {
    title,
    servings,
    cookTime,
    ingredients,
    directions,
  }
}

export async function importRecipe(url: string) {
  try {
    const html = await fetchPageHtml(url)
    const $ = cheerio.load(html)
    const jsonLdScript = $("script[type='application/ld+json']").html()
    if (jsonLdScript) {
      const jsonDetais = tryMetadata(jsonLdScript)
      if (jsonDetais) {
        return formatData(jsonDetais, url)
      }
    }
    return tryHtmlSelectors($)
  } catch (error) {
    return null
  }
}

function getDomain(url: string): string {
  if (!url) {
    throw Error("Invalid url")
  }

  try {
    const urlObj = new URL(url)
    let hostname = urlObj.hostname

    // Remove "www." if present
    if (hostname.startsWith("www.")) {
      hostname = hostname.substring(4)
    }
    return hostname
  } catch (error) {
    throw Error("Invalid url")
  }
}

function formatDuration(duration: string | null) {
  if (!duration) {
    return null
  }

  const regex =
    /P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?/
  const match = duration.match(regex)

  if (!match) {
    return null
  }

  const years = parseInt(match[1] || "0", 10)
  const months = parseInt(match[2] || "0", 10)
  const days = parseInt(match[3] || "0", 10)
  const hours = parseInt(match[4] || "0", 10)
  const minutes = parseInt(match[5] || "0", 10)
  const seconds = parseFloat(match[6] || "0")

  const minutesInHour = 60
  const minutesInDay = minutesInHour * 24
  const minutesInMonth = minutesInDay * 30.44 // Average days per month
  const minutesInYear = minutesInDay * 365.25 // Average days per year

  let totalMinutes = 0

  totalMinutes += years * minutesInYear
  totalMinutes += months * minutesInMonth
  totalMinutes += days * minutesInDay
  totalMinutes += hours * minutesInHour
  totalMinutes += minutes
  totalMinutes += seconds / 60

  return totalMinutes
}

function formatServings(servings: any) {
  if (typeof servings === "number") {
    return `${servings} servings`
  }
  if (typeof servings === "string") {
    if (typeof parseInt(servings) === "number") {
      return servings
    }
    return servings
  }
  if (Array.isArray(servings)) {
    let intValue
    let strValue
    servings.forEach((item) => {
      if (typeof parseInt(item) === "number") {
        intValue = item
      } else {
        strValue = item
      }
    })
    if (strValue) {
      return strValue
    }
    return `${intValue} servings`
  }
}

function formatPhotos(photos: any) {
  if (Array.isArray(photos)) {
    return photos.map((photo) => {
      if (typeof photo === "string") {
        return photo
      }

      if (photo["@type"] === "ImageObject") {
        return photo.url ?? photo.URL
      }
    })
  }

  if (photos["@type"] === "ImageObject") {
    return [photos.url ?? photos.URL]
  }

  if (typeof photos === "string") {
    return [photos]
  }
}

function formatKeywords(keywords: any) {
  function removeWordBeforeColon(val: string): string {
    const colonIndex = val.indexOf(":")
    if (colonIndex === -1) {
      return val // Return original string if no colon is found
    }
    return val.substring(colonIndex + 1)
  }

  function isValidDate(dateString: string): boolean {
    const date = new Date(dateString)
    return date instanceof Date && !isNaN(date.getTime())
  }

  function fixMarkupCharacters(word: string) {
    return word.replace(/&amp;/g, "&")
  }

  if (Array.isArray(keywords)) {
    return keywords.map((word) => {
      if (typeof word === "string") {
        const fixedVal = fixMarkupCharacters(removeWordBeforeColon(word).trim())
        if (!isValidDate(fixedVal)) {
          return fixedVal.toLowerCase()
        }
      }
    })
  }

  if (typeof keywords === "string") {
    return keywords.split(",").map((word) => {
      const fixedVal = fixMarkupCharacters(removeWordBeforeColon(word).trim())
      if (!isValidDate(fixedVal)) {
        return fixedVal.toLowerCase()
      }
    })
  }
}

function formatDirections(directions: any) {
  return directions?.map((inst: any) =>
    typeof inst === "string" ? inst : inst.text
  )
}

// if totalTime does not match prep and cook time
// add remaining total time to cook time, or subtract from prep time
function handleTimeDescrepency(
  prepTime: number,
  cookTime: number,
  totalTime: number
) {
  if (totalTime < prepTime + cookTime) {
    return {
      prepTime: null,
      cookTime: totalTime,
    }
  }

  if (totalTime > prepTime + cookTime) {
    return {
      prepTime,
      cookTime: totalTime - prepTime,
    }
  }

  return {
    prepTime,
    cookTime,
  }
}

function formatData(recipeData: any, url: string) {
  const { prepTime, cookTime } = handleTimeDescrepency(
    formatDuration(recipeData.prepTime) || 0,
    formatDuration(recipeData.cookTime) || 0,
    formatDuration(recipeData.totalTime) || 0
  )

  return {
    author: {
      name: getDomain(url),
      url,
    },
    title: recipeData.name,
    description: recipeData.description,
    servings: formatServings(recipeData.recipeYield) ?? `1 serving`,
    prepTime,
    cookTime,
    ingredients: recipeData.recipeIngredient || [],
    directions: formatDirections(recipeData.recipeInstructions) || [],
    photos: formatPhotos(recipeData.image),
    datePublished: recipeData.datePublished,
    dateModified: recipeData.dateModified,
    tags: formatKeywords(recipeData.keywords)?.filter(
      (word) => word !== null && word !== undefined
    ),
  }
}