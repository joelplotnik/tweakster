class Api::V1::IgdbController < ApplicationController
  def search
    query = params[:query].to_s.strip
    return render json: { error: 'Missing query' }, status: :bad_request if query.blank?

    results = Igdb::SearchService.new(query).call

    if results
      render json: results
    else
      render json: { error: 'IGDB search failed' }, status: :bad_gateway
    end
  end
end
