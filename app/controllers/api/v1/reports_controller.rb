class Api::V1::ReportsController < ApplicationController
    load_and_authorize_resource
    before_action :authenticate_user!

    def index
        if current_user.admin?
          reports = Report.all
          render json: reports
        else
          render json: { error: "You are not authorized to access this page." }, status: :forbidden
        end
    end

    def create
      report = current_user.reports.build(report_params)
      
      if report.valid?
        if report.save
          render json: report, status: :created
        else
          render json: { error: "Failed to create report." }, status: :unprocessable_entity
        end
      else
        if report.errors.full_messages.include?("Content type has already been reported by this user")
          render json: { error: "You have already reported this content." }, status: :unprocessable_entity
        else
          render json: report.errors, status: :unprocessable_entity
        end
      end
    end
    
    private
    
    def report_params
      params.permit(:content_type, :content_id, :reason)
    end
  end
  