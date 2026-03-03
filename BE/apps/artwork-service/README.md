# Artwork Service

This service is responsible for managing artworks, including their organization into folders and tagging.

## Overview

The Artwork Service is a specialized microservice that handles the entire lifecycle of an artwork, from creation and organization to management and discovery. It provides a comprehensive set of CRUD operations with advanced search capabilities, hierarchical folder structures, and a flexible tagging system. The service is built with NestJS and uses the CQRS pattern.

## Features

### 🎨 Artwork Management
- **Complete CRUD Operations**: Create, read, update, and delete artworks with comprehensive validation.
- **Status Lifecycle Management**: Manage the status of artworks (e.g., DRAFT, AVAILABLE, SOLD).
- **Image Management**: Add, remove, and update images associated with an artwork.

### 📁 Folder Organization
- **Hierarchical Folders**: Organize artworks into nested folders.
- **Folder Management**: Create, update, delete, and move folders.

### 🏷️ Tagging
- **Dynamic Tag Management**: Create, read, update, and delete tags.
- **Tag-Based Search**: Search for artworks based on their tags.

## Architecture

### Technology Stack
- **Framework**: NestJS with TypeScript
- **GraphQL**: Apollo Server with a schema-first approach
- **Database**: PostgreSQL with TypeORM

### Core Components
- **`ArtworksResolver`**: Handles GraphQL queries and mutations for artworks.
- **`ArtworkFolderResolver`**: Handles GraphQL queries and mutations for artwork folders.
- **`TagsResolver`**: Handles GraphQL queries and mutations for tags.
- **CQRS**: Command and Query handlers for write and read operations.

## GraphQL API

### Queries

#### Artwork Queries
- `artwork(id: String!)`: Retrieves a single artwork by its ID.
- `artworks(options: FindManyArtworkInput)`: Retrieves a list of artworks.
- `searchArtworks(sellerId: String!, q: String!, skip: Int, take: Int)`: Searches for artworks.
- `artworksByTags(sellerId: String!, tagIds: [String!]!, match: String, skip: Int, take: Int)`: Finds artworks by their tags.
- `countArtworksByStatus(sellerId: String!)`: Counts artworks by their status.

#### Artwork Folder Queries
- `artworkFolder(id: String!)`: Retrieves a single artwork folder by its ID.
- `artworkFolders(options: FindManyArtworkFolderInput)`: Retrieves a list of artwork folders.
- `artworkFolderTree(sellerId: String!)`: Retrieves the folder hierarchy for a seller.
- `artworksInFolder(folderId: String!)`: Retrieves the artworks within a folder.
- `countArtworksInFolder(folderId: String!)`: Counts the artworks within a folder.

#### Tag Queries
- `tag(id: String!)`: Retrieves a single tag by its ID.
- `tags(sellerId: String, status: String, skip: Int, take: Int)`: Retrieves a list of tags.
- `searchTags(q: String!, sellerId: String, limit: Int)`: Searches for tags.

### Mutations

#### Artwork Mutations
- `createArtwork(input: CreateArtworkInput!)`: Creates a new artwork.
- `updateArtwork(id: String!, input: UpdateArtworkInput!)`: Updates an existing artwork.
- `deleteArtwork(id: String!)`: Deletes an artwork.
- `markArtworkAsSold(id: String!, quantity: Int)`: Marks an artwork as sold.
- `addImagesToArtwork(id: String!, images: [ArtworkImageInput!]!)`: Adds images to an artwork.
- `removeImagesFromArtwork(id: String!, imageIds: [String!]!)`: Removes images from an artwork.
- `updateArtworkImages(id: String!, images: [ArtworkImageInput!]!)`: Updates the images of an artwork.

#### Artwork Folder Mutations
- `createArtworkFolder(input: CreateArtworkFolderInput!)`: Creates a new artwork folder.
- `updateArtworkFolder(id: String!, input: UpdateArtworkFolderInput!)`: Updates an existing artwork folder.
- `deleteArtworkFolder(id: String!)`: Deletes an artwork folder.
- `moveArtworkFolder(input: MoveFolderInput!)`: Moves an artwork folder.
- `createDefaultRootFolder(sellerId: String!)`: Creates a default root folder for a seller.

#### Tag Mutations
- `createTag(input: CreateTagInput!)`: Creates a new tag.
- `updateTag(id: String!, input: UpdateTagInput!)`: Updates an existing tag.
- `deleteTag(id: String!)`: Deletes a tag.