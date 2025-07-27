<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectResource\Pages;
use App\Filament\Resources\ProjectResource\RelationManagers\ImagesRelationManager;
use App\Models\Project;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Form;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static ?string $navigationIcon = 'heroicon-o-rectangle-stack';

    public static function form(Form $form): Form
    {
        return $form
            ->schema([
                TextInput::make('title')
                    ->label('Título')
                    ->required()
                    ->maxLength(255)
                    ->placeholder('Projeto 01')
                    ->live(onBlur: true),
                TextInput::make('slug')
                    ->label('Slug')
                    ->dehydrated()
                    ->required()
                    ->unique(ignoreRecord: true)
                    ->maxLength(255)
                    ->slugify('title'),
                Textarea::make('description')
                    ->label('Descrição')
                    ->rows(4)
                    ->maxLength(500)
                    ->nullable(),
                TextInput::make('repo_url')
                    ->label('Repositório')
                    ->url()
                    ->maxLength(255)
                    ->nullable(),
                TextInput::make('live_url')
                    ->label('Link ao vivo')
                    ->url()
                    ->maxLength(255)
                    ->nullable(),
                TextInput::make('reference_url')
                    ->label('Referência')
                    ->url()
                    ->maxLength(255)
                    ->nullable(),
                FileUpload::make('image')
                    ->label('Imagem principal')
                    ->image()
                    ->directory('projects')
                    ->imagePreviewHeight('200')
                    ->nullable(),
                Select::make('technologies')
                    ->label('Tecnologias usadas')
                    ->relationship('technologies', 'name')
                    ->multiple()
                    ->preload()
                    ->searchable()
                    ->required(),
                Select::make('status')
                    ->label('Status')
                    ->options([
                        'em andamento' => 'Em andamento',
                        'concluído' => 'Concluído',
                        'pausado' => 'Pausado',
                    ])
                    ->default('em andamento')
                    ->required()
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('title')->searchable()->sortable(),
                TextColumn::make('slug'),
                TextColumn::make('status'),
                TextColumn::make('technologies.name')->label('Tecnologias')->limit(2),
                ImageColumn::make('images.image_path')->label('Imagens'),
                ImageColumn::make('image')->label('Imagem Principal'),
            ])
            ->filters([
                //
            ])
            ->actions([
                Tables\Actions\EditAction::make(),
            ])
            ->bulkActions([
                Tables\Actions\BulkActionGroup::make([
                    Tables\Actions\DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            ImagesRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
