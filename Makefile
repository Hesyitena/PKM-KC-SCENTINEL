.PHONY: up down logs restart rebuild clean

up:
	@docker-compose up -d
	@echo ""
	@echo "=========================================================="
	@echo "🚀 SCENTINEL DOCKER SERVICES STARTED SUCCESSFULLY!"
	@echo "=========================================================="
	@echo "🌐 Frontend (Dashboard) : http://localhost:8081"
	@echo "⚙️  Backend (API)        : http://localhost:8000/api"
	@echo "📚 API Docs (Swagger)   : http://localhost:8000/api/docs"
	@echo "=========================================================="
	@echo "💡 Info: Gunakan 'make down' untuk mematikan server."
	@echo "💡 Info: Gunakan 'make logs' untuk melihat log server."

down:
	@docker-compose down

logs:
	@docker-compose logs -f

restart:
	@docker-compose restart

rebuild:
	@docker-compose down
	@docker-compose up -d --build
	@echo ""
	@echo "=========================================================="
	@echo "🚀 SCENTINEL DOCKER SERVICES REBUILT & STARTED SUCCESSFULLY!"
	@echo "=========================================================="
	@echo "🌐 Frontend (Dashboard) : http://localhost:8081"
	@echo "⚙️  Backend (API)        : http://localhost:8000/api"
	@echo "📚 API Docs (Swagger)   : http://localhost:8000/api/docs"
	@echo "=========================================================="
	@echo "💡 Info: Gunakan 'make down' untuk mematikan server."
	@echo "💡 Info: Gunakan 'make logs' untuk melihat log server."

clean:
	@echo "🧹 Membersihkan 'sampah' image docker yang tidak terpakai..."
	@docker image prune -f
	@echo "✨ Selesai!"
