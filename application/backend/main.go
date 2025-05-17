package main

import (
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rishi-prajapati/PGP/database"
	"github.com/rishi-prajapati/PGP/models"
)

func main() {
	router := gin.Default()
	router.Use(cors.Default())

	db := database.Connect()
	defer db.Close()

	router.GET("/health", func(c *gin.Context) {
		if err := db.Ping(); err != nil {
			log.Println("Database health check failed:", err)
			c.JSON(500, gin.H{"status": "unhealthy", "error": err.Error()})
			return
		}
		c.JSON(200, gin.H{"status": "healthy"})
	})

	router.GET("/notes", func(c *gin.Context) {
		rows, err := db.Query("SELECT id, text, completed FROM notes")
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		defer rows.Close()

		var notes []models.Note
		for rows.Next() {
			var note models.Note
			if err := rows.Scan(&note.ID, &note.Text, &note.Completed); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			notes = append(notes, note)
		}
		c.JSON(http.StatusOK, notes)
	})

	router.POST("/notes", func(c *gin.Context) {
		var note models.Note
		if err := c.ShouldBindJSON(&note); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		err := db.QueryRow(
			"INSERT INTO notes (text, completed) VALUES ($1, $2) RETURNING id",
			note.Text, note.Completed,
		).Scan(&note.ID)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, note)
	})

	router.PUT("/notes/:id", func(c *gin.Context) {
		id := c.Param("id")
		var note models.Note
		if err := c.ShouldBindJSON(&note); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		_, err := db.Exec("UPDATE notes SET text=$1, completed=$2 WHERE id=$3", note.Text, note.Completed, id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, note)
	})

	router.DELETE("/notes/:id", func(c *gin.Context) {
		id := c.Param("id")

		_, err := db.Exec("DELETE FROM notes WHERE id=$1", id)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"message": "Note deleted"})
	})

	router.Run(":8080")
}
